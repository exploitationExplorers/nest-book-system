"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Etcd3 = exports.Watcher = exports.WatchBuilder = void 0;
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
const auth_1 = require("./auth");
const connection_pool_1 = require("./connection-pool");
const namespace_1 = require("./namespace");
const RPC = require("./rpc");
__exportStar(require("./auth"), exports);
__exportStar(require("./builder"), exports);
__exportStar(require("./errors"), exports);
__exportStar(require("./lease"), exports);
__exportStar(require("./lock"), exports);
__exportStar(require("./namespace"), exports);
__exportStar(require("./options"), exports);
__exportStar(require("./range"), exports);
__exportStar(require("./rpc"), exports);
__exportStar(require("./stm"), exports);
__exportStar(require("./election"), exports);
var watch_1 = require("./watch");
Object.defineProperty(exports, "WatchBuilder", { enumerable: true, get: function () { return watch_1.WatchBuilder; } });
Object.defineProperty(exports, "Watcher", { enumerable: true, get: function () { return watch_1.Watcher; } });
/**
 * Etcd3 is a high-level interface for interacting and calling etcd endpoints.
 * It also provides several lower-level clients for directly calling methods.
 *
 * ```
 * const { Etcd3 } = require('etcd3');
 * const client = new Etcd3();
 *
 * await client.put('foo').value('bar');
 * console.log('foo is:', await client.get('foo').string());
 *
 * const keys = await client.getAll().prefix('f').strings();
 * console.log('all keys starting with "f"': keys);
 *
 * await client.delete().all();
 * ```
 */
class Etcd3 extends namespace_1.Namespace {
    /**
     * Creates a new etcd3 client. See the docs on the {@link IOptions} for
     * more information.
     */
    constructor(options = { hosts: '127.0.0.1:2379' }) {
        super(Buffer.from([]), new connection_pool_1.ConnectionPool(options), options);
        /**
         * @internal
         */
        this.auth = new RPC.AuthClient(this.pool);
        /**
         * @internal
         */
        this.maintenance = new RPC.MaintenanceClient(this.pool);
        /**
         * @internal
         */
        this.cluster = new RPC.ClusterClient(this.pool);
    }
    /**
     * Resolves to an array of roles available in etcd.
     */
    getRoles() {
        return this.auth.roleList().then(result => {
            return result.roles.map(role => new auth_1.Role(this.auth, role));
        });
    }
    /**
     * Returns an object to manipulate the role with the provided name.
     */
    role(name) {
        return new auth_1.Role(this.auth, name);
    }
    /**
     * Resolves to an array of users available in etcd.
     */
    getUsers() {
        return this.auth.userList().then(result => {
            return result.users.map(user => new auth_1.User(this.auth, user));
        });
    }
    /**
     * Returns an object to manipulate the user with the provided name.
     */
    user(name) {
        return new auth_1.User(this.auth, name);
    }
    /**
     * `.mock()` allows you to insert an interface that will be called into
     * instead of calling out to the "real" service. `unmock` should be called
     * after mocking is finished.
     *
     * For example:
     *
     * ```
     * const sinon = require('sinon');
     * const { expect } = require('chai');
     *
     * const { Etcd3 } = require('etcd3');
     * const client = new Etcd3();
     *
     * const mock = client.mock({ exec: sinon.stub() });
     * mock.exec.resolves({ kvs: [{ key: 'foo', value: 'bar' }]});
     * const output = client.get('foo').string();
     * expect(output).to.equal('bar');
     * client.unmock();
     * ```
     */
    mock(callable) {
        this.pool.mock(callable);
        return callable;
    }
    /**
     * Removes any previously-inserted mock.
     */
    unmock() {
        this.pool.unmock();
    }
    /**
     * Frees resources associated with the client.
     */
    close() {
        this.pool.close();
    }
}
exports.Etcd3 = Etcd3;
//# sourceMappingURL=index.js.map