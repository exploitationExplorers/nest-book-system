import { Role, User } from './auth';
import { Namespace } from './namespace';
import { IOptions } from './options';
import * as RPC from './rpc';
export * from './auth';
export * from './builder';
export * from './errors';
export * from './lease';
export * from './lock';
export * from './namespace';
export * from './options';
export * from './range';
export * from './rpc';
export * from './stm';
export * from './election';
export { WatchBuilder, Watcher } from './watch';
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
export declare class Etcd3 extends Namespace {
    /**
     * @internal
     */
    readonly auth: RPC.AuthClient;
    /**
     * @internal
     */
    readonly maintenance: RPC.MaintenanceClient;
    /**
     * @internal
     */
    readonly cluster: RPC.ClusterClient;
    /**
     * Creates a new etcd3 client. See the docs on the {@link IOptions} for
     * more information.
     */
    constructor(options?: IOptions);
    /**
     * Resolves to an array of roles available in etcd.
     */
    getRoles(): Promise<Role[]>;
    /**
     * Returns an object to manipulate the role with the provided name.
     */
    role(name: string): Role;
    /**
     * Resolves to an array of users available in etcd.
     */
    getUsers(): Promise<User[]>;
    /**
     * Returns an object to manipulate the user with the provided name.
     */
    user(name: string): User;
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
    mock<T extends Partial<RPC.ICallable<any>>>(callable: T): T;
    /**
     * Removes any previously-inserted mock.
     */
    unmock(): void;
    /**
     * Frees resources associated with the client.
     */
    close(): void;
}
