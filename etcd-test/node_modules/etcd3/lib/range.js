"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Range = void 0;
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
const util_1 = require("./util");
function compare(a, b) {
    if (a.length === 0) {
        return b.length === 0 ? 0 : 1;
    }
    if (b.length === 0) {
        return -1;
    }
    return a.compare(b);
}
function rangableIsPrefix(r) {
    return r.hasOwnProperty('prefix');
}
/**
 * Range represents a byte range in etcd. Parts of this class are based on the
 * logic found internally within etcd here:
 * https://github.com/coreos/etcd/blob/c4a45c57135bf49ae701352c9151dc1be433d1dd/pkg/adt/interval_tree.go
 */
class Range {
    /**
     * Prefix returns a Range that maps to all keys
     * prefixed with the provided string.
     */
    static prefix(prefix) {
        if (prefix.length === 0) {
            return new Range(util_1.zeroKey, util_1.zeroKey);
        }
        return new Range(prefix, (0, util_1.endRangeForPrefix)((0, util_1.toBuffer)(prefix)));
    }
    /**
     * Converts a rangable into a qualified Range.
     */
    static from(v) {
        if (typeof v === 'string' || v instanceof Buffer) {
            return new Range((0, util_1.toBuffer)(v));
        }
        if (v instanceof Range) {
            return v;
        }
        if (rangableIsPrefix(v)) {
            return Range.prefix(v.prefix);
        }
        return new Range(v.start, v.end);
    }
    constructor(start, end = util_1.emptyKey) {
        this.start = (0, util_1.toBuffer)(start);
        this.end = (0, util_1.toBuffer)(end);
    }
    /**
     * Returns whether the byte range includes the provided value.
     */
    includes(value) {
        value = (0, util_1.toBuffer)(value);
        return compare(this.start, value) <= 0 && compare(this.end, value) > 0;
    }
    /**
     * Compares the other range to this one, returning:
     *  -1 if this range comes before the other one
     *  1 if this range comes after the other one
     *  0 if they overlap
     */
    compare(other) {
        const ivbCmpBegin = compare(this.start, other.start);
        const ivbCmpEnd = compare(this.start, other.end);
        const iveCmpBegin = compare(this.end, other.start);
        if (ivbCmpBegin < 0 && iveCmpBegin <= 0) {
            return -1;
        }
        if (ivbCmpEnd >= 0) {
            return 1;
        }
        return 0;
    }
}
exports.Range = Range;
//# sourceMappingURL=range.js.map