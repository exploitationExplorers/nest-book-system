"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeferred = exports.resolveCallOptions = exports.PromiseWrap = exports.debounce = exports.onceEvent = exports.forOwn = exports.delay = exports.sample = exports.minBy = exports.NSApplicator = exports.endRangeForPrefix = exports.toBuffer = exports.emptyKey = exports.zeroKey = void 0;
const errors_1 = require("./errors");
exports.zeroKey = Buffer.from([0]);
exports.emptyKey = Buffer.from([]);
/**
 * Converts the input to a buffer, if it is not already.
 */
function toBuffer(input) {
    if (input instanceof Buffer) {
        return input;
    }
    if (typeof input === 'number') {
        input = String(input);
    }
    return Buffer.from(input);
}
exports.toBuffer = toBuffer;
/**
 * Returns the range_end value for a query for the provided prefix.
 */
function endRangeForPrefix(prefix) {
    const start = toBuffer(prefix);
    let end = Buffer.from(start); // copy to prevent mutation
    for (let i = end.length - 1; i >= 0; i--) {
        if (end[i] < 0xff) {
            end[i]++;
            end = end.slice(0, i + 1);
            return end;
        }
    }
    return exports.zeroKey;
}
exports.endRangeForPrefix = endRangeForPrefix;
/**
 * NSApplicator is used internally to apply a namespace to a given request. It
 * can only be used for a single application.
 */
class NSApplicator {
    constructor(prefix) {
        this.prefix = prefix;
    }
    /**
     * Applies the namespace prefix to the buffer, if it exists.
     */
    applyKey(buf) {
        if (this.prefix.length === 0 || !buf) {
            return buf;
        }
        return Buffer.concat([this.prefix, buf]);
    }
    /**
     * Applies the namespace prefix to a range end. Due to how etcd handle 'zero'
     * ranges, we need special logic here.
     */
    applyRangeEnd(buf) {
        if (this.prefix.length === 0 || !buf) {
            return buf;
        }
        if (buf.equals(exports.zeroKey)) {
            if (!this.endRange) {
                this.endRange = endRangeForPrefix(this.prefix);
            }
            return this.endRange;
        }
        return Buffer.concat([this.prefix, buf]);
    }
    /**
     * Shortcut function to apply the namespace to a GRPC CRUD request. It returns
     * a new request, it does not modify the original.
     */
    applyToRequest(req) {
        if (this.prefix.length === 0) {
            return req;
        }
        // TS doesn't seem to like the spread operator on generics, so O.A it is.
        return Object.assign({}, req, {
            key: this.applyKey(req.key),
            range_end: this.applyRangeEnd(req.range_end),
        });
    }
    /**
     * Removes a namespace prefix from the provided buffer. Throws if the buffer
     * doesn't have the prefix.
     */
    unprefix(buf) {
        if (this.prefix.length === 0) {
            return buf;
        }
        if (!buf.slice(0, this.prefix.length).equals(this.prefix)) {
            throw new errors_1.ClientRuntimeError(`Cannot slice non-existent prefix ${this.prefix} from ${buf}!`);
        }
        return buf.slice(this.prefix.length);
    }
}
exports.NSApplicator = NSApplicator;
/**
 * Creates a new no-op namespace applicator.
 */
NSApplicator.default = new NSApplicator(exports.emptyKey);
/**
 * Returns items with the smallest value as picked by the `prop` function.
 */
function minBy(items, prop) {
    let min = prop(items[0]);
    let output = [items[0]];
    for (let i = 1; i < items.length; i++) {
        const thisMin = prop(items[i]);
        if (thisMin < min) {
            min = thisMin;
            output = [items[i]];
        }
        else if (thisMin === min) {
            output.push(items[i]);
        }
    }
    return output;
}
exports.minBy = minBy;
/**
 * Returns a random element from the list of items.
 */
function sample(items) {
    return items[Math.floor(Math.random() * items.length)];
}
exports.sample = sample;
/**
 * Returns a promise that resolves after a certain amount of time.
 */
function delay(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}
exports.delay = delay;
/**
 * Implementation of lodash forOwn, with stronger typings and no dependency ;)
 */
function forOwn(obj, iterator) {
    const keys = Object.keys(obj);
    for (const key of keys) {
        iterator(obj[key], key);
    }
}
exports.forOwn = forOwn;
/**
 * onceEvent returns a promise that resolves once any of the listed events
 * fire on the emitter.
 */
function onceEvent(emitter, ...events) {
    return new Promise((resolve, reject) => {
        const teardown = [];
        const handler = (data, event) => {
            teardown.forEach(t => t());
            if (event === 'error') {
                reject(data);
            }
            else {
                resolve(data);
            }
        };
        events.forEach(event => {
            const fn = (data) => handler(data, event);
            teardown.push(() => emitter.removeListener(event, fn));
            emitter.once(event, fn);
        });
    });
}
exports.onceEvent = onceEvent;
/**
 * A trailing-edge debounce function.
 */
function debounce(duration, fn) {
    let timeout;
    const wrapper = () => {
        wrapper.cancel();
        timeout = setTimeout(fn, duration);
    };
    wrapper.cancel = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
    };
    return wrapper;
}
exports.debounce = debounce;
/**
 * PromiseWrap provides promise-like functions that auto-invoke an exec
 * method when called.
 */
class PromiseWrap {
    /**
     * then implements Promiselike.then()
     */
    then(onFulfilled, onRejected) {
        return this.createPromise().then(onFulfilled, onRejected);
    }
    /**
     * catch implements Promiselike.catch()
     */
    catch(onRejected) {
        return this.createPromise().catch(onRejected);
    }
}
exports.PromiseWrap = PromiseWrap;
/**
 * Applies the defaultOptions or defaultOptions factory to the given
 * call-specific options.
 */
const resolveCallOptions = (callOptions, defaultOptions, context) => {
    if (defaultOptions === undefined) {
        return callOptions;
    }
    if (typeof defaultOptions === 'function') {
        defaultOptions = defaultOptions(context);
    }
    return callOptions ? { ...defaultOptions, ...callOptions } : defaultOptions;
};
exports.resolveCallOptions = resolveCallOptions;
const getDeferred = () => {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
};
exports.getDeferred = getDeferred;
//# sourceMappingURL=util.js.map