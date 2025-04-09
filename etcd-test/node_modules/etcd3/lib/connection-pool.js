"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionPool = exports.Host = void 0;
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
const grpc = require("@grpc/grpc-js");
const proto_loader_1 = require("@grpc/proto-loader");
const cockatiel_1 = require("cockatiel");
const errors_1 = require("./errors");
const util_1 = require("./util");
const packageDefinition = (0, proto_loader_1.loadSync)(`${__dirname}/../proto/rpc.proto`, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const services = grpc.loadPackageDefinition(packageDefinition);
const etcdserverpb = services.etcdserverpb;
const secureProtocolPrefix = 'https:';
/**
 * Strips the https?:// from the start of the connection string.
 * @param {string} name [description]
 */
function removeProtocolPrefix(name) {
    return name.replace(/^https?:\/\//, '');
}
/**
 * Executes a grpc service calls, casting the error (if any) and wrapping
 * into a Promise.
 */
function runServiceCall(client, metadata, options, method, payload) {
    return new Promise((resolve, reject) => {
        client[method](payload, metadata, options || {}, (err, res) => {
            if (err) {
                reject((0, errors_1.castGrpcError)(err));
            }
            else {
                resolve(res);
            }
        });
    });
}
/**
 * Retrieves and returns an auth token for accessing etcd. This function is
 * based on the algorithm in {@link https://git.io/vHzwh}.
 */
class Authenticator {
    constructor(options, credentials) {
        this.options = options;
        this.credentials = credentials;
        this.awaitingMetadata = null;
    }
    /**
     * Invalides the cached metadata. Clients should call this if they detect
     * that the authentication is no longer valid.
     */
    invalidateMetadata() {
        this.awaitingMetadata = null;
    }
    /**
     * Returns metadata used to make a call to etcd.
     */
    getMetadata() {
        if (this.awaitingMetadata !== null) {
            return this.awaitingMetadata;
        }
        const hosts = typeof this.options.hosts === 'string' ? [this.options.hosts] : this.options.hosts;
        const auth = this.options.auth;
        if (!auth) {
            return Promise.resolve(new grpc.Metadata());
        }
        const attempt = (index, previousRejection) => {
            if (index >= hosts.length) {
                this.awaitingMetadata = null;
                return Promise.reject(previousRejection);
            }
            const meta = new grpc.Metadata();
            const host = removeProtocolPrefix(hosts[index]);
            const context = {
                method: 'authenticate',
                params: { name: auth.username, password: auth.password },
                service: 'Auth',
                isStream: false,
            };
            return this.getCredentialsFromHost(host, auth.username, auth.password, (0, util_1.resolveCallOptions)((0, util_1.resolveCallOptions)(undefined, auth.callOptions, context), (0, util_1.resolveCallOptions)(undefined, this.options.defaultCallOptions, context), context), this.credentials)
                .then(token => {
                meta.set('token', token);
                return meta;
            })
                .catch(err => attempt(index + 1, err));
        };
        return (this.awaitingMetadata = attempt(0));
    }
    /**
     * Retrieves an auth token from etcd.
     */
    getCredentialsFromHost(address, name, password, callOptions, credentials) {
        return runServiceCall(new etcdserverpb.Auth(address, credentials), new grpc.Metadata(), callOptions, 'authenticate', { name, password }).then(res => res.token);
    }
}
const defaultCircuitBreaker = () => (0, cockatiel_1.circuitBreaker)((0, cockatiel_1.handleWhen)(errors_1.isRecoverableError), {
    halfOpenAfter: 5000,
    breaker: new cockatiel_1.ConsecutiveBreaker(3),
});
/**
 * A Host is one instance of the etcd server, which can contain multiple
 * services. It holds GRPC clients to communicate with the host, and will
 * be removed from the connection pool upon server failures.
 */
class Host {
    constructor(host, channelCredentials, channelOptions, faultHandling = defaultCircuitBreaker()) {
        this.channelCredentials = channelCredentials;
        this.channelOptions = channelOptions;
        this.faultHandling = faultHandling;
        this.closed = false;
        this.cachedServices = Object.create(null);
        this.host = removeProtocolPrefix(host);
    }
    /**
     * Returns the given GRPC service on the current host.
     */
    getServiceClient(name) {
        const service = this.cachedServices[name];
        if (service) {
            return service;
        }
        if (this.closed) {
            throw new errors_1.ClientClosedError(name);
        }
        const newService = new etcdserverpb[name](this.host, this.channelCredentials, this.channelOptions);
        this.cachedServices[name] = newService;
        return newService;
    }
    /**
     * Closes the all clients for the given host, allowing them to be
     * reestablished on subsequent calls.
     */
    resetAllServices() {
        for (const service of Object.values(this.cachedServices)) {
            if (service) {
                // workaround: https://github.com/grpc/grpc-node/issues/1487
                const state = service.getChannel().getConnectivityState(false);
                if (state === grpc.connectivityState.CONNECTING) {
                    service.waitForReady(Date.now() + 1000, () => setImmediate(() => service.close()));
                }
                else {
                    service.close();
                }
            }
        }
        this.cachedServices = Object.create(null);
    }
    /**
     * Close frees resources associated with the host, tearing down any
     * existing client
     */
    close() {
        this.resetAllServices();
        this.closed = true;
    }
}
exports.Host = Host;
/**
 * Connection wraps GRPC hosts. Note that this wraps the hosts themselves; each
 * host can contain multiple discreet services.
 */
class ConnectionPool {
    constructor(options) {
        var _a, _b, _c, _d;
        this.options = options;
        this.callOptionsFactory = this.options.defaultCallOptions;
        this.globalPolicy = (_b = (_a = this.options.faultHandling) === null || _a === void 0 ? void 0 : _a.global) !== null && _b !== void 0 ? _b : (0, cockatiel_1.retry)((0, cockatiel_1.handleWhen)(errors_1.isRecoverableError), { maxAttempts: 3 });
        const credentials = this.buildAuthentication();
        const { hosts = '127.0.0.1:2379', grpcOptions } = this.options;
        if (typeof hosts === 'string') {
            this.hosts = [
                new Host(hosts, credentials, grpcOptions, (_d = (_c = options.faultHandling) === null || _c === void 0 ? void 0 : _c.host) === null || _d === void 0 ? void 0 : _d.call(_c, hosts)),
            ];
        }
        else if (hosts.length === 0) {
            throw new Error('Cannot construct an etcd client with no hosts specified');
        }
        else {
            this.hosts = hosts.map(h => { var _a, _b; return new Host(h, credentials, grpcOptions, (_b = (_a = options.faultHandling) === null || _a === void 0 ? void 0 : _a.host) === null || _b === void 0 ? void 0 : _b.call(_a, h)); });
        }
    }
    /**
     * Sets a mock interface to use instead of hitting real services.
     */
    mock(callable) {
        this.mockImpl = callable;
    }
    /**
     * Removes any existing mock.
     */
    unmock() {
        this.mockImpl = null;
    }
    /**
     * Tears down all ongoing connections and resoruces.
     */
    close() {
        this.hosts.forEach(host => host.close());
    }
    /**
     * @override
     */
    async exec(serviceName, method, payload, options) {
        if (this.mockImpl) {
            return this.mockImpl.exec(serviceName, method, payload);
        }
        const shuffleGen = this.shuffledHosts();
        let lastError;
        try {
            return await this.globalPolicy.execute(() => this.withConnection(serviceName, async ({ client, metadata }) => {
                const resolvedOpts = (0, util_1.resolveCallOptions)(options, this.callOptionsFactory, {
                    service: serviceName,
                    method,
                    params: payload,
                    isStream: false,
                });
                try {
                    return await runServiceCall(client, metadata, resolvedOpts, method, payload);
                }
                catch (err) {
                    if (err instanceof errors_1.EtcdInvalidAuthTokenError) {
                        this.authenticator.invalidateMetadata();
                        return this.exec(serviceName, method, payload, options);
                    }
                    lastError = err;
                    throw err;
                }
            }, shuffleGen));
        }
        catch (e) {
            // If we ran into an error that caused the a circuit to open, but we had
            // an error before that happened, throw the original error rather than
            // the broken circuit error.
            if ((0, cockatiel_1.isBrokenCircuitError)(e) && lastError && !(0, cockatiel_1.isBrokenCircuitError)(lastError)) {
                throw lastError;
            }
            else {
                throw e;
            }
        }
    }
    /**
     * @override
     */
    async withConnection(service, fn, shuffleGenerator = this.shuffledHosts()) {
        if (this.mockImpl) {
            return this.mockImpl.withConnection(service, fn);
        }
        const metadata = await this.authenticator.getMetadata();
        let lastError;
        for (let i = 0; i < this.hosts.length; i++) {
            const host = shuffleGenerator.next().value;
            let didCallThrough = false;
            try {
                return await host.faultHandling.execute(() => {
                    didCallThrough = true;
                    return fn({ resource: host, client: host.getServiceClient(service), metadata });
                });
            }
            catch (e) {
                if ((0, errors_1.isRecoverableError)(e)) {
                    host.resetAllServices();
                }
                // Check if the call was blocked by some circuit breaker/bulkhead policy
                if (didCallThrough) {
                    throw (0, errors_1.castGrpcError)(e);
                }
                lastError = e;
            }
        }
        if (!lastError) {
            throw new errors_1.ClientRuntimeError('Connection pool has no hosts');
        }
        throw (0, errors_1.castGrpcError)(lastError);
    }
    /**
     * @override
     */
    markFailed(resource, error) {
        error = (0, errors_1.castGrpcError)(error);
        let threw = false;
        if ((0, errors_1.isRecoverableError)(error)) {
            resource.resetAllServices();
        }
        resource.faultHandling
            .execute(() => {
            if (!threw) {
                threw = true;
                throw error;
            }
        })
            .catch(() => undefined);
    }
    /**
     * A generator function that endlessly loops through hosts in a
     * fisher-yates shuffle for each iteration.
     */
    *shuffledHosts() {
        const hosts = this.hosts.slice();
        while (true) {
            for (let i = hosts.length - 1; i >= 0; i--) {
                const idx = ConnectionPool.deterministicOrder ? i : Math.floor((i + 1) * Math.random());
                [hosts[idx], hosts[i]] = [hosts[i], hosts[idx]];
                yield hosts[i];
            }
        }
    }
    /**
     * Creates authentication credentials to use for etcd clients.
     */
    buildAuthentication() {
        const { credentials } = this.options;
        let protocolCredentials = grpc.credentials.createInsecure();
        if (credentials) {
            protocolCredentials = grpc.credentials.createSsl(credentials.rootCertificate, credentials.privateKey, credentials.certChain);
        }
        else if (this.hasSecureHost()) {
            protocolCredentials = grpc.credentials.createSsl();
        }
        this.authenticator = new Authenticator(this.options, protocolCredentials);
        return protocolCredentials;
    }
    /**
     * Returns whether any configured host is set up to use TLS.
     */
    hasSecureHost() {
        const { hosts } = this.options;
        if (typeof hosts === 'string') {
            return hosts.startsWith(secureProtocolPrefix);
        }
        const countSecure = hosts.filter(host => host.startsWith(secureProtocolPrefix)).length;
        if (countSecure === 0) {
            return false;
        }
        if (countSecure < hosts.length) {
            throw new Error('etcd3 cannot be configured with a mix of secure and insecure hosts');
        }
        return true;
    }
}
exports.ConnectionPool = ConnectionPool;
/**
 * Toggles whether hosts are looped through in a deterministic order.
 * For use in tests, should not be toggled in production/
 */
ConnectionPool.deterministicOrder = false;
//# sourceMappingURL=connection-pool.js.map