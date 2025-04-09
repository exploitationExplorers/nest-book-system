"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComparatorBuilder = exports.PutBuilder = exports.DeleteBuilder = exports.MultiRangeBuilder = exports.SingleRangeBuilder = exports.RangeBuilder = exports.compareTarget = exports.comparator = void 0;
const range_1 = require("./range");
const RPC = require("./rpc");
const util_1 = require("./util");
const emptyBuffer = Buffer.from([]);
/**
 * Comparators can be passed to various operations in the ComparatorBuilder.
 */
exports.comparator = {
    '==': RPC.CompareResult.Equal,
    '===': RPC.CompareResult.Equal,
    '>': RPC.CompareResult.Greater,
    '<': RPC.CompareResult.Less,
    '!=': RPC.CompareResult.NotEqual,
    '!==': RPC.CompareResult.NotEqual,
};
/**
 * compareTarget are the types of things that can be compared against.
 */
exports.compareTarget = {
    Value: 'value',
    Version: 'version',
    Create: 'create_revision',
    Mod: 'mod_revision',
    Lease: 'lease',
};
/**
 * assertWithin throws a helpful error message if the value provided isn't
 * a key in the given map.
 */
function assertWithin(map, value, thing) {
    if (!(value in map)) {
        const keys = Object.keys(map).join('" "');
        throw new Error(`Unexpected "${String(value)}" in ${thing}. Possible values are: "${keys}"`);
    }
}
/**
 * RangeBuilder is a primitive builder for range queries on the kv store.
 * It's extended by the Single and MultiRangeBuilders, which contain
 * the concrete methods to execute the built query.
 */
class RangeBuilder extends util_1.PromiseWrap {
    constructor(namespace) {
        super();
        this.namespace = namespace;
        this.request = {};
    }
    /**
     * revision is the point-in-time of the key-value store to use for the range.
     */
    revision(rev) {
        this.request.revision = rev;
        return this;
    }
    /**
     * serializable sets the range request to use serializable member-local reads.
     */
    serializable(serializable) {
        this.request.serializable = serializable;
        return this;
    }
    /**
     * minModRevision sets the minimum modified revision of keys to return.
     */
    minModRevision(minModRevision) {
        this.request.min_mod_revision = minModRevision;
        return this;
    }
    /**
     * maxModRevision sets the maximum modified revision of keys to return.
     */
    maxModRevision(maxModRevision) {
        this.request.max_mod_revision = maxModRevision;
        return this;
    }
    /**
     * minCreateRevision sets the minimum create revision of keys to return.
     */
    minCreateRevision(minCreateRevision) {
        this.request.min_create_revision = minCreateRevision;
        return this;
    }
    /**
     * maxCreateRevision sets the maximum create revision of keys to return.
     */
    maxCreateRevision(maxCreateRevision) {
        this.request.max_create_revision = maxCreateRevision;
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
     * Returns the request op for this builder, used in transactions.
     */
    op() {
        return Promise.resolve({ request_range: this.namespace.applyToRequest(this.request) });
    }
}
exports.RangeBuilder = RangeBuilder;
/**
 * SingleRangeBuilder is a query builder that looks up a single key.
 */
class SingleRangeBuilder extends RangeBuilder {
    constructor(kv, namespace, key) {
        super(namespace);
        this.kv = kv;
        this.request.key = (0, util_1.toBuffer)(key);
        this.request.limit = 1;
    }
    /**
     * Runs the built request and parses the returned key as JSON,
     * or returns `null` if it isn't found.
     */
    json() {
        return this.string().then(JSON.parse);
    }
    /**
     * Runs the built request and returns the value of the returned key as a
     * string, or `null` if it isn't found.
     */
    string(encoding = 'utf8') {
        return this.exec().then(res => res.kvs.length === 0 ? null : res.kvs[0].value.toString(encoding));
    }
    /**
     * Runs the built request, and returns the value parsed as a number. Resolves
     * as NaN if the value can't be parsed as a number.
     */
    number() {
        return this.string().then(value => (value === null ? null : Number(value)));
    }
    /**
     * Runs the built request and returns the value of the returned key as a
     * buffer, or `null` if it isn't found.
     */
    buffer() {
        return this.exec().then(res => (res.kvs.length === 0 ? null : res.kvs[0].value));
    }
    /**
     * Returns whether the key exists.
     */
    exists() {
        this.request.keys_only = true;
        return this.exec().then(r => r.count !== '0');
    }
    /**
     * Runs the built request and returns the raw response from etcd.
     */
    exec() {
        return this.kv.range(this.namespace.applyToRequest(this.request), this.callOptions);
    }
    /**
     * @override
     */
    createPromise() {
        return this.string();
    }
}
exports.SingleRangeBuilder = SingleRangeBuilder;
/**
 * MultiRangeBuilder is a query builder that looks up multiple keys.
 */
class MultiRangeBuilder extends RangeBuilder {
    constructor(kv, namespace) {
        super(namespace);
        this.kv = kv;
        this.prefix(emptyBuffer);
    }
    /**
     * Prefix instructs the query to scan for all keys that have the provided
     * prefix.
     */
    prefix(value) {
        return this.inRange(range_1.Range.prefix(value));
    }
    /**
     * inRange instructs the builder to get keys in the specified byte range.
     */
    inRange(r) {
        const range = range_1.Range.from(r);
        this.request.key = range.start;
        this.request.range_end = range.end;
        return this;
    }
    /**
     * All will instruct etcd to get all keys.
     */
    all() {
        return this.prefix('');
    }
    /**
     * Limit sets the maximum number of results to retrieve.
     */
    limit(count) {
        this.request.limit = isFinite(count) ? count : 0;
        return this;
    }
    /**
     * Sort specifies how the result should be sorted.
     */
    sort(target, order) {
        assertWithin(RPC.SortTarget, target, 'sort order in client.get().sort(...)');
        assertWithin(RPC.SortOrder, order, 'sort order in client.get().sort(...)');
        this.request.sort_target = RPC.SortTarget[target];
        this.request.sort_order = RPC.SortOrder[order];
        return this;
    }
    /**
     * count returns the number of keys that match the query.
     */
    count() {
        this.request.count_only = true;
        return this.exec().then(res => Number(res.count));
    }
    /**
     * Keys returns an array of keys matching the query.
     */
    keys(encoding = 'utf8') {
        this.request.keys_only = true;
        return this.exec().then(res => {
            return res.kvs.map(kv => kv.key.toString(encoding));
        });
    }
    /**
     * Keys returns an array of keys matching the query, as buffers.
     */
    keyBuffers() {
        this.request.keys_only = true;
        return this.exec().then(res => {
            return res.kvs.map(kv => kv.key);
        });
    }
    /**
     * Runs the built request and parses the returned keys as JSON.
     */
    json() {
        return this.mapValues(buf => JSON.parse(buf.toString()));
    }
    /**
     * Runs the built request and returns the value of the returned key as a
     * string, or `null` if it isn't found.
     */
    strings(encoding = 'utf8') {
        return this.mapValues(buf => buf.toString(encoding));
    }
    /**
     * Runs the built request and returns the values of keys as numbers. May
     * resolve to NaN if the keys do not contain numbers.
     */
    numbers() {
        return this.mapValues(buf => Number(buf.toString()));
    }
    /**
     * Runs the built request and returns the value of the returned key as a
     * buffers.
     */
    buffers() {
        return this.mapValues(b => b);
    }
    /**
     * Runs the built request and returns the raw response from etcd.
     */
    exec() {
        return this.kv
            .range(this.namespace.applyToRequest(this.request), this.callOptions)
            .then(res => {
            for (const kv of res.kvs) {
                kv.key = this.namespace.unprefix(kv.key);
            }
            return res;
        });
    }
    /**
     * @override
     */
    createPromise() {
        return this.strings();
    }
    /**
     * Dispatches a call to the server, and creates a map by running the
     * iterator over the values returned.
     */
    mapValues(iterator) {
        return this.exec().then(res => {
            const output = {};
            for (const kv of res.kvs) {
                output[kv.key.toString()] = iterator(kv.value);
            }
            return output;
        });
    }
}
exports.MultiRangeBuilder = MultiRangeBuilder;
/**
 * DeleteBuilder builds a deletion.
 */
class DeleteBuilder extends util_1.PromiseWrap {
    constructor(kv, namespace) {
        super();
        this.kv = kv;
        this.namespace = namespace;
        this.request = {};
    }
    /**
     * key sets a single key to be deleted.
     */
    key(value) {
        this.request.key = (0, util_1.toBuffer)(value);
        this.request.range_end = undefined;
        return this;
    }
    /**
     * key sets a single key to be deleted.
     */
    prefix(value) {
        return this.range(range_1.Range.prefix(value));
    }
    /**
     * Sets the byte range of values to delete.
     */
    range(range) {
        this.request.key = range.start;
        this.request.range_end = range.end;
        return this;
    }
    /**
     * All will instruct etcd to wipe all keys.
     */
    all() {
        return this.prefix('');
    }
    /**
     * inRange instructs the builder to delete keys in the specified byte range.
     */
    inRange(r) {
        const range = range_1.Range.from(r);
        this.request.key = range.start;
        this.request.range_end = range.end;
        return this;
    }
    /**
     * getPrevious instructs etcd to *try* to get the previous value of the
     * key before setting it. One may not always be available if a compaction
     * takes place.
     */
    getPrevious() {
        this.request.prev_kv = true;
        return this.exec().then(res => res.prev_kvs);
    }
    /**
     * Sets the GRPC call options for this request.
     */
    options(options) {
        this.callOptions = options;
        return this;
    }
    /**
     * exec runs the delete put request.
     */
    exec() {
        return this.kv.deleteRange(this.namespace.applyToRequest(this.request), this.callOptions);
    }
    /**
     * Returns the request op for this builder, used in transactions.
     */
    op() {
        return Promise.resolve({
            request_delete_range: this.namespace.applyToRequest(this.request),
        });
    }
    /**
     * @override
     */
    createPromise() {
        return this.exec();
    }
}
exports.DeleteBuilder = DeleteBuilder;
/**
 * PutBuilder builds a "put" request to etcd.
 */
class PutBuilder extends util_1.PromiseWrap {
    constructor(kv, namespace, key) {
        super();
        this.kv = kv;
        this.namespace = namespace;
        this.request = {};
        this.request.key = (0, util_1.toBuffer)(key);
    }
    /**
     * value sets the value that will be stored in the key.
     */
    value(value) {
        this.request.value = (0, util_1.toBuffer)(value);
        return this;
    }
    /**
     * Sets the lease value to use for storing the key. You usually don't
     * need to use this directly, use `client.lease()` instead!
     */
    lease(lease) {
        this.leaseFilter = lease;
        return this;
    }
    /**
     * Updates the key on its current lease, regardless of what that lease is.
     */
    ignoreLease() {
        this.request.ignore_lease = true;
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
     * getPrevious instructs etcd to *try* to get the previous value of the
     * key before setting it. One may not always be available if a compaction
     * takes place.
     */
    getPrevious() {
        this.request.prev_kv = true;
        return this.exec().then(res => ({ ...res.prev_kv, header: res.header }));
    }
    /**
     * Touch updates the key's revision without changing its value. This is
     * equivalent to the etcd 'ignore value' flag.
     */
    touch() {
        this.request.value = undefined;
        this.request.ignore_value = true;
        return this.exec();
    }
    /**
     * exec runs the put request.
     */
    async exec() {
        await this.applyLease();
        return this.kv.put(this.namespace.applyToRequest(this.request), this.callOptions);
    }
    /**
     * Returns the request op for this builder, used in transactions.
     */
    async op() {
        await this.applyLease();
        return { request_put: this.namespace.applyToRequest(this.request) };
    }
    /**
     * @override
     */
    createPromise() {
        return this.exec();
    }
    async applyLease() {
        if (!this.leaseFilter) {
            return;
        }
        if (typeof this.leaseFilter === 'number' || typeof this.leaseFilter === 'string') {
            this.request.lease = this.leaseFilter;
        }
        this.request.lease = await this.leaseFilter;
    }
}
exports.PutBuilder = PutBuilder;
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
class ComparatorBuilder {
    constructor(kv, namespace) {
        this.kv = kv;
        this.namespace = namespace;
        this.request = { compare: [], success: [], failure: [] };
    }
    /**
     * Sets the GRPC call options for this request.
     */
    options(options) {
        this.callOptions = options;
        return this;
    }
    /**
     * Adds a new clause to the transaction.
     */
    and(key, column, cmp, value) {
        assertWithin(exports.compareTarget, column, 'comparison target in client.and(...)');
        assertWithin(exports.comparator, cmp, 'comparator in client.and(...)');
        if (column === 'Value') {
            value = (0, util_1.toBuffer)(value);
        }
        this.request.compare.push(Promise.resolve({
            key: this.namespace.applyKey((0, util_1.toBuffer)(key)),
            result: exports.comparator[cmp],
            target: RPC.CompareTarget[column],
            [exports.compareTarget[column]]: value,
        }));
        return this;
    }
    /**
     * Adds one or more consequent clauses to be executed if the comparison
     * is truthy.
     */
    then(...clauses) {
        this.request.success = this.mapOperations(clauses);
        return this;
    }
    /**
     * Adds one or more consequent clauses to be executed if the comparison
     * is falsey.
     */
    else(...clauses) {
        this.request.failure = this.mapOperations(clauses);
        return this;
    }
    /**
     * Runs the generated transaction and returns its result.
     */
    async commit() {
        return this.kv.txn({
            compare: await Promise.all(this.request.compare),
            failure: await Promise.all(this.request.failure),
            success: await Promise.all(this.request.success),
        }, this.callOptions);
    }
    /**
     * Low-level method to add
     */
    mapOperations(ops) {
        return ops.map(op => {
            if (typeof op.op === 'function') {
                return op.op();
            }
            return Promise.resolve(op);
        });
    }
}
exports.ComparatorBuilder = ComparatorBuilder;
//# sourceMappingURL=builder.js.map