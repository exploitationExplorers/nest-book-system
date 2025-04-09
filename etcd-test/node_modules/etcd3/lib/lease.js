"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lease = exports.LeaseState = void 0;
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
const events_1 = require("events");
const builder_1 = require("./builder");
const errors_1 = require("./errors");
const RPC = require("./rpc");
const util_1 = require("./util");
function throwIfError(value) {
    if (value instanceof Error) {
        throw value;
    }
    return value;
}
function leaseExpired(lease) {
    return lease.TTL === '0';
}
/**
 * Implements RPC.ICallable. Wraps a pool and adds the `leaseID` to outgoing
 * put requests before executing them.
 */
class LeaseClientWrapper {
    constructor(pool, lease) {
        this.pool = pool;
        this.lease = lease;
        this.callOptionsFactory = this.pool.callOptionsFactory;
    }
    exec(service, method, payload) {
        return this.pool.exec(service, method, payload).catch(err => {
            if (err instanceof errors_1.EtcdLeaseInvalidError) {
                this.lease.emitLoss(err);
            }
            throw err;
        });
    }
    markFailed(host, error) {
        this.pool.markFailed(host, error);
    }
    withConnection() {
        throw new Error('not supported');
    }
}
var LeaseState;
(function (LeaseState) {
    LeaseState[LeaseState["Pending"] = 0] = "Pending";
    LeaseState[LeaseState["Alive"] = 1] = "Alive";
    LeaseState[LeaseState["Revoked"] = 2] = "Revoked";
})(LeaseState || (exports.LeaseState = LeaseState = {}));
/**
 * Lease is a high-level manager for etcd leases.
 * Leases are great for things like service discovery:
 *
 * ```
 * const os = require('os');
 * const { Etcd3 } = require('etcd3');
 * const client = new Etcd3();
 *
 * const hostPrefix = 'available-hosts/';
 *
 * function grantLease() {
 *   const lease = client.lease(10); // set a TTL of 10 seconds
 *
 *   lease.on('lost', err => {
 *     console.log('We lost our lease as a result of this error:', err);
 *     console.log('Trying to re-grant it...');
 *     grantLease();
 *   })
 *
 *   await lease.put(hostPrefix + os.hostname()).value('');
 * }
 *
 * function getAvailableHosts() {
 *   const keys = await client.getAll().prefix(hostPrefix).keys();
 *   return keys.map(key => key.slice(hostPrefix.length));
 * }
 * ```
 * @noInheritDoc
 */
class Lease extends events_1.EventEmitter {
    get state() {
        return this.innerState;
    }
    constructor(pool, namespace, ttl, options = {}) {
        super();
        this.pool = pool;
        this.namespace = namespace;
        this.ttl = ttl;
        this.innerState = LeaseState.Pending;
        this.client = new RPC.LeaseClient(this.pool);
        this.teardown = () => {
            /* noop */
        };
        const { autoKeepAlive, deadline, ...rest } = options;
        this.defaultOptions = rest;
        if (!ttl || ttl < 1) {
            throw new RangeError(`The TTL in an etcd lease must be at least 1 second. Got: ${ttl}`);
        }
        this.leaseID = this.client
            .leaseGrant({ TTL: ttl }, options)
            .then(res => {
            if (this.innerState === LeaseState.Revoked) {
                return res.ID;
            }
            this.innerState = LeaseState.Alive;
            this.lastKeepAlive = Date.now();
            if (autoKeepAlive !== false) {
                this.keepalive();
            }
            return res.ID;
        })
            .catch(err => {
            this.emitLoss(err);
            // return, don't throw, from here so that if no one is listening to
            // grant() we don't crash the process.
            return err;
        });
    }
    /**
     * Grant waits for the lease to be granted. You generally don't need to
     * call this, as any operations with `.put` will queue automatically.
     *
     * Calling this multiple times is safe; it won't try to request multipl leases.
     *
     * It rejects if the lease cannot be granted, in additon to the `lost`
     * event firing.
     */
    grant() {
        return this.leaseID.then(throwIfError);
    }
    /**
     * Revoke frees the lease from etcd. Keys that the lease owns will be
     * evicted.
     */
    async revoke(options = this.defaultOptions) {
        this.close();
        const id = await this.leaseID;
        if (id instanceof Error) {
            // if an error, we didn't grant in the first place
            return;
        }
        try {
            await this.client.leaseRevoke({ ID: id }, options);
        }
        catch (e) {
            if (!(e instanceof errors_1.EtcdLeaseInvalidError)) {
                throw e;
            }
        }
    }
    /**
     * releasePassively stops making heartbeats for the lease, and allows it
     * to expire automatically when its TTL rolls around. Use `revoke()` to
     * actively tell etcd to terminate the lease.
     */
    release() {
        this.close();
    }
    /**
     * Put returns a put builder that operates within the current lease.
     */
    put(key) {
        return new builder_1.PutBuilder(new RPC.KVClient(new LeaseClientWrapper(this.pool, this)), this.namespace, key).lease(this.grant());
    }
    /**
     * keepaliveOnce fires an immediate keepalive for the lease.
     */
    keepaliveOnce(options = this.defaultOptions) {
        return Promise.all([this.client.leaseKeepAlive(options), this.grant()]).then(([stream, id]) => {
            return new Promise((resolve, reject) => {
                stream.on('data', resolve);
                stream.on('error', err => reject((0, errors_1.castGrpcError)(err)));
                stream.write({ ID: id });
            }).then(res => {
                stream.end();
                if (leaseExpired(res)) {
                    const err = new errors_1.EtcdLeaseInvalidError(res.ID);
                    this.emitLoss(err);
                    throw err;
                }
                this.lastKeepAlive = Date.now();
                return res;
            });
        });
    }
    /**
     * Returns whether etcd has told us that this lease revoked.
     */
    revoked() {
        return this.innerState === LeaseState.Revoked;
    }
    /**
     * Implements EventEmitter.on(...).
     */
    on(event, handler) {
        // tslint:disable-line
        return super.on(event, handler);
    }
    /**
     * Tears down resources associated with the lease.
     */
    close() {
        this.innerState = LeaseState.Revoked;
        this.teardown();
    }
    /**
     * Emits the error as having caused this lease to die, and tears
     * down the lease.
     */
    emitLoss(err) {
        this.close();
        this.emit('lost', err);
    }
    /**
     * keepalive starts a loop keeping the lease alive.
     */
    keepalive() {
        // When the cluster goes down, we keep trying to reconnect. But if we're
        // far past the end of our key's TTL, there's no way we're going to be
        // able to renew it. Fire a "lost".
        if (Date.now() - this.lastKeepAlive > 2 * 1000 * this.ttl) {
            this.close();
            this.emit('lost', new errors_1.EtcdLeaseInvalidError('We lost connection to etcd and our lease has expired.'));
            return;
        }
        this.client
            .leaseKeepAlive()
            .then(stream => {
            if (this.innerState === LeaseState.Revoked) {
                return stream.end();
            }
            // this is what the official Go client uses, good enough:
            const keepAliveInterval = (1000 * this.ttl) / 3;
            const keepaliveTimer = setInterval(() => this.fireKeepAlive(stream), keepAliveInterval);
            const keepAliveTimeout = (0, util_1.debounce)(1000 * this.ttl, () => this.handleKeepaliveError(new errors_1.GRPCCancelledError('GRPC watch stream has timed out.')));
            this.teardown = () => {
                this.teardown = () => undefined;
                keepAliveTimeout.cancel();
                clearInterval(keepaliveTimer);
                stream.end();
            };
            keepAliveTimeout(); // start the debounce
            stream
                .on('error', err => this.handleKeepaliveError(err))
                .on('data', res => {
                if (leaseExpired(res)) {
                    return this.handleKeepaliveError(new errors_1.EtcdLeaseInvalidError(res.ID));
                }
                this.lastKeepAlive = Date.now();
                keepAliveTimeout();
                this.emit('keepaliveSucceeded', res);
            });
            this.emit('keepaliveEstablished');
            return this.fireKeepAlive(stream);
        })
            .catch(err => this.handleKeepaliveError(err));
    }
    fireKeepAlive(stream) {
        this.emit('keepaliveFired');
        return this.grant()
            .then(id => stream.write({ ID: id }))
            .catch(() => this.close()); // will only throw if the initial grant failed
    }
    handleKeepaliveError(err) {
        if (this.innerState === LeaseState.Revoked) {
            return; // often write-after-end, or something along those lines
        }
        this.emit('keepaliveFailed', (0, errors_1.castGrpcError)(err));
        this.teardown();
        if (err instanceof errors_1.EtcdLeaseInvalidError) {
            this.emitLoss(err);
        }
        else {
            setTimeout(() => this.keepalive(), 100);
        }
    }
}
exports.Lease = Lease;
//# sourceMappingURL=lease.js.map