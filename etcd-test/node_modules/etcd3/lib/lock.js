"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lock = void 0;
const builder_1 = require("./builder");
const errors_1 = require("./errors");
const lease_1 = require("./lease");
const RPC = require("./rpc");
/**
 * A Lock can be used for distributed locking to create atomic operations
 * across multiple systems. An EtcdLockFailedError is thrown if the lock
 * can't be acquired.
 *
 * Under the hood, the Lock uses a lease on a key which is revoked when the
 * the lock is released. If the server the lock is running on dies, or the
 * network is disconnected, etcd will time out the lock.
 *
 * Bear in mind that this means that in certain rare situations (a network
 * disconnect or wholesale etcd failure), the caller may lose the lock while
 * operations may still be running.
 *
 * A quick example:
 *
 * ```
 * const { Etcd3 } = require('etcd3');
 * const client = new Etcd3();
 *
 * client.lock('my_resource').do(() => {
 *   // The lock will automatically be released when this promise returns
 *   return doMyAtomicAction();
 * });
 * ```
 */
class Lock {
    constructor(pool, namespace, key) {
        this.pool = pool;
        this.namespace = namespace;
        this.key = key;
        this.leaseTTL = 30;
    }
    /**
     * Sets the TTL of the lease underlying the lock. The lease TTL defaults
     * to 30 seconds.
     */
    ttl(seconds) {
        if (this.lease) {
            throw new Error('Cannot set a lock TTL after acquiring the lock');
        }
        this.leaseTTL = seconds;
        return this;
    }
    /**
     * Sets the GRPC call options for this request.
     */
    options(options) {
        this.callOptions = options;
        return this;
    }
    /**
     * Acquire attempts to acquire the lock, rejecting if it's unable to.
     */
    acquire() {
        const lease = (this.lease = new lease_1.Lease(this.pool, this.namespace, this.leaseTTL));
        const kv = new RPC.KVClient(this.pool);
        return lease.grant().then(leaseID => {
            return new builder_1.ComparatorBuilder(kv, this.namespace)
                .and(this.key, 'Create', '==', 0)
                .then(new builder_1.PutBuilder(kv, this.namespace, this.key).value('').lease(leaseID))
                .options(this.callOptions)
                .commit()
                .then(res => {
                if (res.succeeded) {
                    return this;
                }
                return this.release()
                    .catch(() => undefined)
                    .then(() => {
                    throw new errors_1.EtcdLockFailedError(`Failed to acquire a lock on ${this.key}`);
                });
            });
        });
    }
    /**
     * Returns the lease associated with this lock, if any. Returns null if
     * the lock has not been acquired.
     */
    leaseId() {
        return this.lease ? this.lease.grant() : Promise.resolve(null);
    }
    /**
     * Release frees the lock.
     */
    release() {
        if (!this.lease) {
            throw new Error('Attempted to release a lock which was not acquired');
        }
        return this.lease.revoke(this.callOptions);
    }
    /**
     * `do()` wraps the inner function. It acquires the lock before running
     * the function, and releases the lock after any promise the function
     * returns resolves or throws.
     */
    do(fn) {
        return this.acquire()
            .then(fn)
            .then(value => this.release().then(() => value))
            .catch(err => this.release().then(() => {
            throw err;
        }));
    }
}
exports.Lock = Lock;
//# sourceMappingURL=lock.js.map