/// <reference types="node" />
export type Rangable = Range | string | Buffer | {
    start: string | Buffer;
    end: string | Buffer;
} | {
    prefix: string | Buffer;
};
/**
 * Range represents a byte range in etcd. Parts of this class are based on the
 * logic found internally within etcd here:
 * https://github.com/coreos/etcd/blob/c4a45c57135bf49ae701352c9151dc1be433d1dd/pkg/adt/interval_tree.go
 */
export declare class Range {
    /**
     * Prefix returns a Range that maps to all keys
     * prefixed with the provided string.
     */
    static prefix(prefix: string | Buffer): Range;
    /**
     * Converts a rangable into a qualified Range.
     */
    static from(v: Rangable): Range;
    readonly start: Buffer;
    readonly end: Buffer;
    constructor(start: Buffer | string, end?: Buffer | string);
    /**
     * Returns whether the byte range includes the provided value.
     */
    includes(value: string | Buffer): boolean;
    /**
     * Compares the other range to this one, returning:
     *  -1 if this range comes before the other one
     *  1 if this range comes after the other one
     *  0 if they overlap
     */
    compare(other: Range): number;
}
