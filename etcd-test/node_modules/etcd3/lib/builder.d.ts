/// <reference types="node" />
import * as grpc from '@grpc/grpc-js';
import { Rangable, Range } from './range';
import * as RPC from './rpc';
import { NSApplicator, PromiseWrap } from './util';
/**
 * Comparators can be passed to various operations in the ComparatorBuilder.
 */
export declare const comparator: {
    '==': RPC.CompareResult;
    '===': RPC.CompareResult;
    '>': RPC.CompareResult;
    '<': RPC.CompareResult;
    '!=': RPC.CompareResult;
    '!==': RPC.CompareResult;
};
export interface ICompareTarget {
    value: RPC.CompareTarget;
    key: keyof RPC.ICompare;
}
export interface IOperation {
    op(): Promise<RPC.IRequestOp>;
}
/**
 * compareTarget are the types of things that can be compared against.
 */
export declare const compareTarget: {
    [key in keyof typeof RPC.CompareTarget]: keyof RPC.ICompare;
};
/**
 * RangeBuilder is a primitive builder for range queries on the kv store.
 * It's extended by the Single and MultiRangeBuilders, which contain
 * the concrete methods to execute the built query.
 */
export declare abstract class RangeBuilder<T> extends PromiseWrap<T> implements IOperation {
    protected readonly namespace: NSApplicator;
    protected request: RPC.IRangeRequest;
    protected callOptions: grpc.CallOptions | undefined;
    constructor(namespace: NSApplicator);
    /**
     * revision is the point-in-time of the key-value store to use for the range.
     */
    revision(rev: number | string): this;
    /**
     * serializable sets the range request to use serializable member-local reads.
     */
    serializable(serializable: boolean): this;
    /**
     * minModRevision sets the minimum modified revision of keys to return.
     */
    minModRevision(minModRevision: number | string): this;
    /**
     * maxModRevision sets the maximum modified revision of keys to return.
     */
    maxModRevision(maxModRevision: number | string): this;
    /**
     * minCreateRevision sets the minimum create revision of keys to return.
     */
    minCreateRevision(minCreateRevision: number | string): this;
    /**
     * maxCreateRevision sets the maximum create revision of keys to return.
     */
    maxCreateRevision(maxCreateRevision: number | string): this;
    /**
     * Sets the GRPC call options for this request.
     */
    options(options: grpc.CallOptions | undefined): this;
    /**
     * Returns the request op for this builder, used in transactions.
     */
    op(): Promise<RPC.IRequestOp>;
}
/**
 * SingleRangeBuilder is a query builder that looks up a single key.
 */
export declare class SingleRangeBuilder extends RangeBuilder<string | null> {
    private readonly kv;
    constructor(kv: RPC.KVClient, namespace: NSApplicator, key: string | Buffer);
    /**
     * Runs the built request and parses the returned key as JSON,
     * or returns `null` if it isn't found.
     */
    json(): Promise<unknown>;
    /**
     * Runs the built request and returns the value of the returned key as a
     * string, or `null` if it isn't found.
     */
    string(encoding?: BufferEncoding): Promise<string | null>;
    /**
     * Runs the built request, and returns the value parsed as a number. Resolves
     * as NaN if the value can't be parsed as a number.
     */
    number(): Promise<number | null>;
    /**
     * Runs the built request and returns the value of the returned key as a
     * buffer, or `null` if it isn't found.
     */
    buffer(): Promise<Buffer | null>;
    /**
     * Returns whether the key exists.
     */
    exists(): Promise<boolean>;
    /**
     * Runs the built request and returns the raw response from etcd.
     */
    exec(): Promise<RPC.IRangeResponse>;
    /**
     * @override
     */
    protected createPromise(): Promise<string | null>;
}
/**
 * MultiRangeBuilder is a query builder that looks up multiple keys.
 */
export declare class MultiRangeBuilder extends RangeBuilder<{
    [key: string]: string;
}> {
    private readonly kv;
    constructor(kv: RPC.KVClient, namespace: NSApplicator);
    /**
     * Prefix instructs the query to scan for all keys that have the provided
     * prefix.
     */
    prefix(value: string | Buffer): this;
    /**
     * inRange instructs the builder to get keys in the specified byte range.
     */
    inRange(r: Rangable): this;
    /**
     * All will instruct etcd to get all keys.
     */
    all(): this;
    /**
     * Limit sets the maximum number of results to retrieve.
     */
    limit(count: number): this;
    /**
     * Sort specifies how the result should be sorted.
     */
    sort(target: keyof typeof RPC.SortTarget, order: keyof typeof RPC.SortOrder): this;
    /**
     * count returns the number of keys that match the query.
     */
    count(): Promise<number>;
    /**
     * Keys returns an array of keys matching the query.
     */
    keys(encoding?: BufferEncoding): Promise<string[]>;
    /**
     * Keys returns an array of keys matching the query, as buffers.
     */
    keyBuffers(): Promise<Buffer[]>;
    /**
     * Runs the built request and parses the returned keys as JSON.
     */
    json(): Promise<{
        [key: string]: unknown;
    }>;
    /**
     * Runs the built request and returns the value of the returned key as a
     * string, or `null` if it isn't found.
     */
    strings(encoding?: BufferEncoding): Promise<{
        [key: string]: string;
    }>;
    /**
     * Runs the built request and returns the values of keys as numbers. May
     * resolve to NaN if the keys do not contain numbers.
     */
    numbers(): Promise<{
        [key: string]: number;
    }>;
    /**
     * Runs the built request and returns the value of the returned key as a
     * buffers.
     */
    buffers(): Promise<{
        [key: string]: Buffer;
    }>;
    /**
     * Runs the built request and returns the raw response from etcd.
     */
    exec(): Promise<RPC.IRangeResponse>;
    /**
     * @override
     */
    protected createPromise(): Promise<{
        [key: string]: string;
    }>;
    /**
     * Dispatches a call to the server, and creates a map by running the
     * iterator over the values returned.
     */
    private mapValues;
}
/**
 * DeleteBuilder builds a deletion.
 */
export declare class DeleteBuilder extends PromiseWrap<RPC.IDeleteRangeResponse> {
    private readonly kv;
    private readonly namespace;
    private request;
    private callOptions;
    constructor(kv: RPC.KVClient, namespace: NSApplicator);
    /**
     * key sets a single key to be deleted.
     */
    key(value: string | Buffer): this;
    /**
     * key sets a single key to be deleted.
     */
    prefix(value: string | Buffer): this;
    /**
     * Sets the byte range of values to delete.
     */
    range(range: Range): this;
    /**
     * All will instruct etcd to wipe all keys.
     */
    all(): this;
    /**
     * inRange instructs the builder to delete keys in the specified byte range.
     */
    inRange(r: Rangable): this;
    /**
     * getPrevious instructs etcd to *try* to get the previous value of the
     * key before setting it. One may not always be available if a compaction
     * takes place.
     */
    getPrevious(): Promise<RPC.IKeyValue[]>;
    /**
     * Sets the GRPC call options for this request.
     */
    options(options: grpc.CallOptions | undefined): this;
    /**
     * exec runs the delete put request.
     */
    exec(): Promise<RPC.IDeleteRangeResponse>;
    /**
     * Returns the request op for this builder, used in transactions.
     */
    op(): Promise<RPC.IRequestOp>;
    /**
     * @override
     */
    protected createPromise(): Promise<RPC.IDeleteRangeResponse>;
}
/**
 * PutBuilder builds a "put" request to etcd.
 */
export declare class PutBuilder extends PromiseWrap<RPC.IPutResponse> {
    private readonly kv;
    private readonly namespace;
    private request;
    private leaseFilter?;
    private callOptions;
    constructor(kv: RPC.KVClient, namespace: NSApplicator, key: string | Buffer);
    /**
     * value sets the value that will be stored in the key.
     */
    value(value: string | Buffer | number): this;
    /**
     * Sets the lease value to use for storing the key. You usually don't
     * need to use this directly, use `client.lease()` instead!
     */
    lease(lease: number | string | Promise<string | number>): this;
    /**
     * Updates the key on its current lease, regardless of what that lease is.
     */
    ignoreLease(): this;
    /**
     * Sets the GRPC call options for this request.
     */
    options(options: grpc.CallOptions | undefined): this;
    /**
     * getPrevious instructs etcd to *try* to get the previous value of the
     * key before setting it. One may not always be available if a compaction
     * takes place.
     */
    getPrevious(): Promise<RPC.IKeyValue & {
        header: RPC.IResponseHeader;
    }>;
    /**
     * Touch updates the key's revision without changing its value. This is
     * equivalent to the etcd 'ignore value' flag.
     */
    touch(): Promise<RPC.IPutResponse>;
    /**
     * exec runs the put request.
     */
    exec(): Promise<RPC.IPutResponse>;
    /**
     * Returns the request op for this builder, used in transactions.
     */
    op(): Promise<RPC.IRequestOp>;
    /**
     * @override
     */
    protected createPromise(): Promise<RPC.IPutResponse>;
    private applyLease;
}
/**
 * ComparatorBuilder builds a comparison between keys. This can be used
 * for atomic operations in etcd, such as locking:
 *
 * ```
 * const id = uuid.v4();
 *
 * function lock() {
 *   return client.if('my_lock', 'Create', '==', 0)
 *     .then(client.put('my_lock').value(id))
 *     .else(client.get('my_lock'))
 *     .commit()
 *     .then(result => console.log(result.succeeded === id ? 'lock acquired' : 'already locked'));
 * }
 *
 * function unlock() {
 *   return client.if('my_lock', 'Value', '==', id)
 *     .then(client.delete().key('my_lock'))
 *     .commit();
 * }
 * ```
 */
export declare class ComparatorBuilder {
    private readonly kv;
    private readonly namespace;
    private request;
    private callOptions;
    constructor(kv: RPC.KVClient, namespace: NSApplicator);
    /**
     * Sets the GRPC call options for this request.
     */
    options(options: grpc.CallOptions | undefined): this;
    /**
     * Adds a new clause to the transaction.
     */
    and(key: string | Buffer, column: keyof typeof RPC.CompareTarget, cmp: keyof typeof comparator, value: string | Buffer | number): this;
    /**
     * Adds one or more consequent clauses to be executed if the comparison
     * is truthy.
     */
    then(...clauses: (RPC.IRequestOp | IOperation)[]): this;
    /**
     * Adds one or more consequent clauses to be executed if the comparison
     * is falsey.
     */
    else(...clauses: (RPC.IRequestOp | IOperation)[]): this;
    /**
     * Runs the generated transaction and returns its result.
     */
    commit(): Promise<RPC.ITxnResponse>;
    /**
     * Low-level method to add
     */
    mapOperations(ops: (RPC.IRequestOp | IOperation)[]): Promise<RPC.IRequestOp>[];
}
