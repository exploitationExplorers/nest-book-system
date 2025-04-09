/// <reference types="node" />
import * as grpc from '@grpc/grpc-js';
import { ConnectionPool } from './connection-pool';
import { NSApplicator } from './util';
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
export declare class Lock {
    private readonly pool;
    private readonly namespace;
    private key;
    private leaseTTL;
    private lease;
    private callOptions;
    constructor(pool: ConnectionPool, namespace: NSApplicator, key: string | Buffer);
    /**
     * Sets the TTL of the lease underlying the lock. The lease TTL defaults
     * to 30 seconds.
     */
    ttl(seconds: number): this;
    /**
     * Sets the GRPC call options for this request.
     */
    options(options: grpc.CallOptions): this;
    /**
     * Acquire attempts to acquire the lock, rejecting if it's unable to.
     */
    acquire(): Promise<this>;
    /**
     * Returns the lease associated with this lock, if any. Returns null if
     * the lock has not been acquired.
     */
    leaseId(): Promise<string | null>;
    /**
     * Release frees the lock.
     */
    release(): Promise<void>;
    /**
     * `do()` wraps the inner function. It acquires the lock before running
     * the function, and releases the lock after any promise the function
     * returns resolves or throws.
     */
    do<T>(fn: () => T | Promise<T>): Promise<T>;
}
