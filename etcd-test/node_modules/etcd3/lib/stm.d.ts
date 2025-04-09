/// <reference types="node" />
import * as grpc from '@grpc/grpc-js';
import * as Builder from './builder';
import * as RPC from './rpc';
import { NSApplicator } from './util';
/**
 * Isolation level which can be passed into the ISTMOptions.
 */
export declare const enum Isolation {
    /**
     * SerializableSnapshot provides serializable isolation and
     * also checks for write conflicts.
     */
    SerializableSnapshot = 0,
    /**
     * Serializable reads within the same transaction attempt return data
     * from the at the revision of the first read.
     */
    Serializable = 1,
    /**
     * RepeatableReads reads within the same transaction attempt always
     * return the same data.
     */
    RepeatableReads = 2,
    /**
     * ReadCommitted reads keys from any committed revision.
     */
    ReadCommitted = 3
}
/**
 * ISTMOptions are optionally passed to `etcd3.stm(options)`.
 */
export interface ISTMOptions {
    /**
     * Number of times we'll retry the transaction if we get a conflict.
     * Defaults to 3.
     */
    retries: number;
    /**
     * WithPrefetch is a hint to prefetch a list of keys before trying to apply.
     * If an STM transaction will unconditionally fetch a set of keys, prefetching
     * those keys will save the round-trip cost from requesting
     * each key one by one with `.get()`.
     */
    prefetch: string[];
    /**
     * Isolation level for the transaction. Defaults to SerializableSnapshot.
     */
    isolation: Isolation;
    /**
     * Options to pass into the STM transaction's commit.
     */
    callOptions?: grpc.CallOptions;
}
/**
 * SoftwareTransaction is an implementation of software transaction memory,
 * described in greater detail [here](https://coreos.com/blog/transactional-memory-with-etcd3.html).
 * The idea is that you can have a block that contains multiple reads
 * and writes, then we'll commit all those changes as a single transaction,
 * automatically retrying as necessary.
 *
 * Inside the `.transact()` block, all reads and writes **must** go through
 * the transaction, not the client, or they won't be tracked.
 *
 * For example, this is a safe way to move 'money' between `bank/account1` and
 * `bank/account2`:
 *
 * ```js
 * const amount = 42;
 *
 * etcd3.stm().transact(tx => {
 *   return Promise.all([
 *     tx.get('bank/account1').number(),
 *     tx.get('bank/account2').number(),
 *   ]).then(([balance1, balance2]) => {
 *     if (balance1 < amount) {
 *       throw new Error('You do not have enough money to transfer!');
 *     }
 *
 *     return Promise.all([
 *       tx.put('bank/account1').value(balance1 - amount),
 *       tx.put('bank/account2').value(balance2 + amount),
 *     ]);
 *   });
 * });
 * ```
 *
 * (Note: the author does not condone using etcd for your banking infrastructure)
 */
export declare class SoftwareTransaction {
    private readonly options;
    private readonly namespace;
    private readonly rawKV;
    private readonly kv;
    private tx;
    constructor(options: ISTMOptions, namespace: NSApplicator, rawKV: RPC.KVClient);
    /**
     * transact runs the function with the current configuration. It will be
     * retried until the transaction succeeds, or until the maximum number of
     * retries has been exceeded.
     */
    transact<T>(fn: (tx: this) => T | PromiseLike<T>): Promise<T>;
    /**
     * `.get()` starts a query to look up a single key from etcd.
     */
    get(key: string): Builder.SingleRangeBuilder;
    /**
     * `.put()` starts making a put request against etcd.
     */
    put(key: string | Buffer): Builder.PutBuilder;
    /**
     * `.delete()` starts making a delete request against etcd.
     */
    delete(): Builder.DeleteBuilder;
    private transactInner;
    private commit;
}
