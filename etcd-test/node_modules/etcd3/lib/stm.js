"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoftwareTransaction = void 0;
const bignumber_js_1 = require("bignumber.js");
const Builder = require("./builder");
const errors_1 = require("./errors");
const range_1 = require("./range");
const util_1 = require("./util");
/**
 * Converts the key/value pair to a partial response that contains it. The
 * response *will not* contain header or revision information.
 */
function keyValueToResponse(key, value) {
    key = (0, util_1.toBuffer)(key);
    if (!value) {
        return { kvs: [], more: false, count: '0' };
    }
    return {
        kvs: [
            {
                key: Buffer.from(key),
                value,
            },
        ],
        more: false,
        count: '1',
    };
}
/**
 * ReadSet records a set of reads in a SoftwareTransaction.
 */
class ReadSet {
    constructor() {
        this.reads = Object.create(null);
        this.completedReads = [];
        this.earliestMod = new bignumber_js_1.default(Infinity);
    }
    /**
     * Returns the earliest modified revision of any key in this change set.
     */
    earliestModRevision() {
        return this.earliestMod;
    }
    /**
     * Add checks to the comparator to make sure that the mod revision of all
     * keys read during the transaction are the same.
     */
    addCurrentChecks(cmp) {
        this.completedReads.forEach(({ key, res }) => {
            if (res.kvs.length) {
                cmp.and(key, 'Mod', '==', res.kvs[0].mod_revision);
            }
            else {
                cmp.and(key, 'Mod', '==', 0);
            }
        });
    }
    /**
     * runRequest sets read options and executes the outgoing request.
     */
    runRequest(kv, req) {
        const key = req.key.toString();
        const previous = this.reads[key];
        if (previous) {
            return previous;
        }
        const promise = kv.range(req).then(res => {
            this.completedReads.push({ key: req.key, res });
            if (res.kvs.length > 0) {
                this.earliestMod = bignumber_js_1.default.min(new bignumber_js_1.default(res.kvs[0].mod_revision), this.earliestMod);
            }
            return res;
        });
        this.reads[key] = promise;
        return promise;
    }
}
/**
 * WriteSet records a set of writes in a SoftwareTransaction.
 */
class WriteSet {
    constructor() {
        this.ops = [];
    }
    /**
     * Add checks to make sure that none of the write tagets have changed since
     * the given revision.
     */
    addNotChangedChecks(cmp, sinceBeforeMod) {
        if (sinceBeforeMod === 'Infinity') {
            return; // no reads were made
        }
        this.ops.forEach(op => {
            switch (op.op) {
                case 0 /* WriteKind.Write */:
                    cmp.and(op.req.key, 'Mod', '<', sinceBeforeMod);
                    break;
                case 1 /* WriteKind.DeleteKey */:
                    cmp.and(op.key, 'Mod', '<', sinceBeforeMod);
                    break;
                case 2 /* WriteKind.DeleteRange */:
                    // error, no way to check that every single key in that range is the same
                    throw new Error(`You cannot delete ranges in the SerializableSnapshot isolation level`);
                default:
                    throw new errors_1.ClientRuntimeError(`Unexpected write op ${JSON.stringify(op)}`);
            }
        });
    }
    /**
     * Adds the changed keys as consequents of the builder.
     */
    addChanges(cmp) {
        const clauses = [];
        this.ops.forEach(op => {
            switch (op.op) {
                case 0 /* WriteKind.Write */:
                    clauses.push({ request_put: op.req });
                    break;
                case 1 /* WriteKind.DeleteKey */:
                    clauses.push({ request_delete_range: op.req });
                    break;
                case 2 /* WriteKind.DeleteRange */:
                    clauses.push({ request_delete_range: op.req });
                    break;
                default:
                    throw new errors_1.ClientRuntimeError(`Unexpected write op ${JSON.stringify(op)}`);
            }
        });
        cmp.then(...clauses);
    }
    /**
     * findExistingWrite returns an existing write (put or delete) against the key.
     * Returns null if no operations against it were recorded.
     */
    findExistingWrite(key) {
        for (let i = this.ops.length - 1; i >= 0; i--) {
            const op = this.ops[i];
            switch (op.op) {
                case 0 /* WriteKind.Write */:
                    if (op.req.key.equals(key)) {
                        return keyValueToResponse(key, op.req.value);
                    }
                    break;
                case 1 /* WriteKind.DeleteKey */:
                    if (op.key.equals(key)) {
                        return keyValueToResponse(key);
                    }
                    break;
                case 2 /* WriteKind.DeleteRange */:
                    if (op.range.includes(key)) {
                        return keyValueToResponse(key);
                    }
                    break;
                default:
                    throw new errors_1.ClientRuntimeError(`Unexpected write op ${JSON.stringify(op)}`);
            }
        }
        return null;
    }
    /**
     * Inserts a put operation into the set.
     */
    addPut(put) {
        this.purgeExistingOperationOn(put.key);
        this.ops.push({ op: 0 /* WriteKind.Write */, req: put });
    }
    /**
     * Inserts a delete operation.
     */
    addDeletion(req) {
        if (req.range_end) {
            this.ops.push({ req, op: 2 /* WriteKind.DeleteRange */, range: new range_1.Range(req.key, req.range_end) });
        }
        else {
            this.purgeExistingOperationOn(req.key);
            this.ops.push({ req, op: 1 /* WriteKind.DeleteKey */, key: req.key });
        }
    }
    purgeExistingOperationOn(key) {
        for (let i = 0; i < this.ops.length; i++) {
            const { op, req } = this.ops[i];
            if (op === 0 /* WriteKind.Write */ || op === 1 /* WriteKind.DeleteKey */) {
                if (req.key.equals(key)) {
                    this.ops.splice(i, 1);
                    break;
                }
            }
        }
    }
}
/**
 * BasicTransaction is the base wrapper class for a transaction. It implements
 * the necessary mechanics for Repeatablereads
 * and ReadCommitted isolation levels.
 */
class BasicTransaction {
    constructor(options) {
        this.options = options;
        this.writeSet = new WriteSet();
        this.readSet = new ReadSet();
    }
    /**
     * Gets the range in a transaction-y way!
     */
    range(kv, req) {
        this.assertReadInvariants(req);
        const existingWrite = this.writeSet.findExistingWrite(req.key);
        if (existingWrite !== null) {
            return Promise.resolve(existingWrite);
        }
        req.serializable = true;
        return this.readSet.runRequest(kv, req);
    }
    /**
     * Schedules the put request in the writeSet.
     */
    put(req) {
        this.assertNoOption('put', req, ['lease', 'prev_kv']);
        this.writeSet.addPut(req);
        return Promise.resolve({});
    }
    /**
     * Schedules the put request in the writeSet.
     */
    deleteRange(req) {
        this.assertNoOption('delete', req, ['prev_kv']);
        this.writeSet.addDeletion(req);
        return Promise.resolve({
            header: undefined,
            deleted: '1',
            prev_kvs: [],
        });
    }
    assertReadInvariants(range) {
        this.assertNoOption('read', range, [
            'revision',
            'range_end',
            'min_mod_revision',
            'max_mod_revision',
            'min_create_revision',
            'max_create_revision',
        ]);
    }
    assertNoOption(req, obj, keys) {
        keys.forEach(key => {
            if (obj[key] !== undefined) {
                throw new Error(`"${String(key)}" is not supported in ${req} requests within STM transactions`);
            }
        });
    }
}
/**
 * BasicTransaction is the class for serializable transactions. It implements
 * the necessary mechanics for SerializableSnapshot
 * and Serializable isolation levels.
 */
class SerializableTransaction extends BasicTransaction {
    constructor(options, kv) {
        super(options);
        options.prefetch.forEach(key => {
            this.range(kv, { key: (0, util_1.toBuffer)(key) }).catch(() => undefined);
        });
    }
    /**
     * @override
     */
    range(kv, req) {
        this.assertReadInvariants(req);
        const existingWrite = this.writeSet.findExistingWrite(req.key);
        if (existingWrite !== null) {
            return Promise.resolve(existingWrite);
        }
        if (!this.firstRead) {
            return (this.firstRead = this.readSet.runRequest(kv, req));
        }
        return this.firstRead.then(res => {
            req.serializable = true;
            req.revision = res.header.revision;
            return this.readSet.runRequest(kv, req);
        });
    }
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
class SoftwareTransaction {
    constructor(options, namespace, rawKV) {
        this.options = options;
        this.namespace = namespace;
        this.rawKV = rawKV;
        this.kv = new Proxy(rawKV, {
            get: (target, key) => {
                switch (key) {
                    case 'range':
                        return (req) => this.tx.range(target, req);
                    case 'put':
                        return (req) => this.tx.put(req);
                    case 'deleteRange':
                        return (req) => this.tx.deleteRange(req);
                    default:
                        throw new errors_1.ClientRuntimeError(`Unexpected kv operation in STM: ${key.toString()}`);
                }
            },
        });
    }
    /**
     * transact runs the function with the current configuration. It will be
     * retried until the transaction succeeds, or until the maximum number of
     * retries has been exceeded.
     */
    transact(fn) {
        return this.transactInner(this.options.retries, fn);
    }
    /**
     * `.get()` starts a query to look up a single key from etcd.
     */
    get(key) {
        return new Builder.SingleRangeBuilder(this.kv, this.namespace, key);
    }
    /**
     * `.put()` starts making a put request against etcd.
     */
    put(key) {
        return new Builder.PutBuilder(this.kv, this.namespace, key);
    }
    /**
     * `.delete()` starts making a delete request against etcd.
     */
    delete() {
        return new Builder.DeleteBuilder(this.kv, this.namespace);
    }
    transactInner(retries, fn) {
        this.tx =
            this.options.isolation === 1 /* Isolation.Serializable */ ||
                this.options.isolation === 0 /* Isolation.SerializableSnapshot */
                ? new SerializableTransaction(this.options, this.rawKV)
                : new BasicTransaction(this.options);
        return Promise.resolve(fn(this)).then(value => {
            return this.commit()
                .then(() => value)
                .catch(err => {
                if (retries === 0 || !(err instanceof errors_1.STMConflictError)) {
                    throw err;
                }
                return this.transactInner(retries - 1, fn);
            });
        });
    }
    commit() {
        const cmp = new Builder.ComparatorBuilder(this.rawKV, util_1.NSApplicator.default);
        switch (this.options.isolation) {
            case 0 /* Isolation.SerializableSnapshot */:
                const earliestMod = this.tx.readSet.earliestModRevision().plus(1).toString();
                this.tx.writeSet.addNotChangedChecks(cmp, earliestMod);
                this.tx.readSet.addCurrentChecks(cmp);
                break;
            case 1 /* Isolation.Serializable */:
                this.tx.readSet.addCurrentChecks(cmp);
                break;
            case 2 /* Isolation.RepeatableReads */:
                this.tx.readSet.addCurrentChecks(cmp);
                break;
            case 3 /* Isolation.ReadCommitted */:
                break; // none
            default:
                throw new Error(`Unknown isolation level "${this.options.isolation}"`);
        }
        this.tx.writeSet.addChanges(cmp);
        return cmp
            .options(this.options.callOptions)
            .commit()
            .then(result => {
            if (!result.succeeded) {
                throw new errors_1.STMConflictError();
            }
        });
    }
}
exports.SoftwareTransaction = SoftwareTransaction;
//# sourceMappingURL=stm.js.map