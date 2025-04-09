"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Watcher = exports.WatchBuilder = exports.operationNames = exports.WatchManager = void 0;
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
const bignumber_js_1 = require("bignumber.js");
const events_1 = require("events");
const errors_1 = require("./errors");
const range_1 = require("./range");
const RPC = require("./rpc");
const util_1 = require("./util");
/**
 * AttachQueue holds a queue of Watchers waiting to be attached to the server.
 * Etcd does not guarentee that watchers are attached in order, so to properly
 * respond to leases and ensure state is consistent, watchers must be attached
 * one at a time.
 * @internal
 */
class AttachQueue {
    constructor(stream) {
        this.stream = stream;
        this.state = 0 /* QueueState.Idle */;
        this.queue = [];
    }
    /**
     * Inserts a watcher to be attached to the stream.
     */
    attach(watcher) {
        this.queue = this.queue.concat(watcher);
        if (this.state === 0 /* QueueState.Idle */) {
            this.readQueue();
        }
    }
    /**
     * Remove the watcher from any pending attach queue.
     */
    dequeue(watcher) {
        this.queue = this.queue.filter(w => w !== watcher);
    }
    /**
     * Dispatches the "create" response to the waiting watcher and fires the
     * next one as necessary.
     */
    handleCreate(res) {
        const watcher = this.queue.shift();
        if (!watcher) {
            throw new errors_1.ClientRuntimeError('Could not find watcher corresponding to create response');
        }
        watcher.id = res.watch_id;
        watcher.emit('connected', res);
        this.readQueue();
    }
    /**
     * Halts future operations on the queue.
     */
    destroy() {
        this.setState(0 /* QueueState.Idle */);
        this.queue = [];
    }
    /**
     * Reads the next watcher to create off the queue and attaches it.
     */
    readQueue() {
        if (this.queue.length === 0) {
            this.setState(0 /* QueueState.Idle */);
            return;
        }
        const watcher = this.queue[0];
        this.setState(2 /* QueueState.Attaching */);
        watcher.emit('connecting', watcher.request);
        this.stream.write({ create_request: watcher.request });
    }
    setState(state) {
        this.state = state;
    }
}
/**
 * The WatchManager is a singleton that exists in namespaces to handle watching
 * multiple keys in a single GRPC stream. The underlying stream will only be
 * alive if there's at least one watcher.
 *
 * This class is not exposed externally.
 */
class WatchManager {
    constructor(client, initialBackoff) {
        this.client = client;
        this.initialBackoff = initialBackoff;
        /**
         * Current state of the watcher.
         */
        this.state = 0 /* State.Idle */;
        /**
         * List of attached watchers.
         */
        this.watchers = [];
        /**
         * Set of watchers we're currently closing.
         */
        this.expectedClosers = new Set();
        this.backoff = initialBackoff.next();
    }
    /**
     * Attach registers the watcher on the connection.
     */
    attach(watcher) {
        this.watchers.push(watcher);
        switch (this.state) {
            case 0 /* State.Idle */:
                this.establishStream();
                break;
            case 1 /* State.Connecting */:
                break;
            case 2 /* State.Connected */:
                this.queue.attach(watcher);
                break;
            default:
                throw new errors_1.ClientRuntimeError(`Unknown watcher state ${this.state}`);
        }
    }
    /**
     * Detaches a watcher from the connection.
     */
    detach(watcher) {
        // If we aren't connected, just remove the watcher, easy.
        if (this.state !== 2 /* State.Connected */) {
            this.watchers = this.watchers.filter(w => w !== watcher);
            return Promise.resolve();
        }
        // If we're awaiting an ID to come back, wait for that to happen or for
        // us to lose connection, whichever happens first.
        if (watcher.id === null) {
            return (0, util_1.onceEvent)(watcher, 'connected', 'disconnected').then(() => this.detach(watcher));
        }
        // If the watcher does have an ID, mark that we expect to close it and
        // run the cancellation request. The 'end' event will get fired when
        // the cancellation comes back, or if we reconnect and see that we
        // wanted to cancel the Watcher.
        this.expectedClosers.add(watcher);
        this.getStream().write({ cancel_request: { watch_id: watcher.id } });
        return (0, util_1.onceEvent)(watcher, 'end').then(async () => {
            // There seem to be some bug(?) in grpc-js where if we call another
            // method in the same task when the stream ended, then we get a GRPC
            // "14 UNAVAILABLE" error. Adding any kind of task boundary resolve this.
            await (0, util_1.delay)(0);
        });
    }
    /**
     * Returns the current GRPC stream, *throwing* if we aren't in a state where
     * we can get the stream. Calls here are only valid if state == Connected
     */
    getStream() {
        if (this.state !== 2 /* State.Connected */) {
            throw new errors_1.ClientRuntimeError('Cannot call getStream() if state != Connected');
        }
        if (!this.stream) {
            throw new errors_1.ClientRuntimeError('Expected the watcher stream to exist while state == Connected');
        }
        return this.stream;
    }
    /**
     * Establishes a GRPC watcher stream, if there are any active watcher.
     */
    establishStream() {
        if (this.state !== 0 /* State.Idle */) {
            throw new errors_1.ClientRuntimeError('Cannot call establishStream() if state != Idle');
        }
        // possible we reconnect and watchers are removed in the meantime
        if (this.watchers.length === 0) {
            return;
        }
        // clear anyone who is in the process of closing, we won't re-add them
        this.expectedClosers.forEach(watcher => {
            this.watchers = this.watchers.filter(w => w !== watcher);
            watcher.emit('end');
        });
        this.expectedClosers.clear();
        this.state = 1 /* State.Connecting */;
        this.client
            .watch()
            .then(stream => {
            this.state = 2 /* State.Connected */;
            this.queue = new AttachQueue(stream);
            this.stream = stream
                .on('data', res => res.created ? this.handleCreatedResponse(res) : this.handleResponse(res))
                .on('error', err => this.handleError(err))
                .on('end', () => this.handleError(new errors_1.EtcdWatchStreamEnded()));
            // possible watchers are remove while we're connecting.
            if (this.watchers.length === 0) {
                return this.destroyStream();
            }
            this.queue.attach(this.watchers);
        })
            .catch(err => this.handleError(err));
    }
    /**
     * Closes the currently attached watcher stream.
     */
    destroyStream() {
        if (this.state !== 2 /* State.Connected */) {
            throw new errors_1.ClientRuntimeError('Cannot call establishStream() if state != Connected');
        }
        if (this.watchers.length > 0) {
            throw new errors_1.ClientRuntimeError('Cannot call destroyStream() with active watchers');
        }
        this.getStream().cancel();
        this.queue.destroy();
    }
    /**
     * Handles an error emission on the current stream. Emits a message out to
     * all attached watchers and tries to reconnect.
     */
    handleError(err) {
        var _a;
        if (this.state === 2 /* State.Connected */) {
            this.queue.destroy();
            this.getStream().cancel();
        }
        this.state = 0 /* State.Idle */;
        this.watchers.forEach(watcher => {
            watcher.emit('disconnected', err);
            watcher.id = null;
        });
        setTimeout(() => {
            if (this.state === 0 /* State.Idle */) {
                this.establishStream();
            }
        }, this.backoff.duration);
        this.backoff = (_a = this.backoff.next()) !== null && _a !== void 0 ? _a : this.backoff;
    }
    /**
     * Handles a cancel update, gracefully closing the watcher if it's expected,
     * or emitting an error if it's not.
     */
    handleCancelResponse(watcher, res) {
        this.watchers = this.watchers.filter(w => w !== watcher);
        if (this.expectedClosers.has(watcher)) {
            this.expectedClosers.delete(watcher);
            watcher.emit('end');
            return;
        }
        watcher.emit('error', (0, errors_1.castGrpcErrorMessage)(`Watcher canceled: ${res.cancel_reason}`));
    }
    /**
     * Emits a data update on the target watcher.
     */
    handleUpdateResponse(watcher, res) {
        try {
            watcher.emit('data', res);
        }
        catch (e) {
            // throw any user errors in a new microtask so they don't get handled
            // as a stream error.
            setImmediate(() => {
                throw e;
            });
        }
    }
    /**
     * Handles the creation of a new watcher from etcd.
     */
    handleCreatedResponse(res) {
        this.backoff = this.initialBackoff.next();
        if (!res.canceled) {
            this.queue.handleCreate(res);
            return;
        }
        // etcd can return both "canceled" and "created" in some cases, see #114.
        // In this case watch_id won't have been assigned yet, so pull the first
        // watcher that doesn't currently have an ID and assume it's the one
        // that caused this error.
        const watcher = this.watchers.find(w => w.id === null);
        if (!watcher) {
            throw new errors_1.ClientRuntimeError('Got a watch creation error, but found no pending watchers');
        }
        this.handleCancelResponse(watcher, res);
    }
    /**
     * Dispatches some a watch response on the event stream.
     */
    handleResponse(res) {
        this.backoff = this.initialBackoff.next();
        const watcher = this.watchers.find(w => w.id === res.watch_id);
        if (!watcher) {
            throw new errors_1.ClientRuntimeError('Failed to find watcher for IWatchResponse');
        }
        if (!res.canceled) {
            this.handleUpdateResponse(watcher, res);
            return;
        }
        this.handleCancelResponse(watcher, res);
        if (this.watchers.length === 0) {
            this.destroyStream();
        }
    }
}
exports.WatchManager = WatchManager;
exports.operationNames = {
    put: RPC.FilterType.Nodelete,
    delete: RPC.FilterType.Noput,
};
/**
 * WatchBuilder is used for creating etcd watchers. The created watchers are
 * resilient against disconnections, automatically resubscribing and replaying
 * changes when reconnecting.
 *
 * ```
 * const client = new Etcd3();
 *
 * client.watch()
 *   .key('foo')
 *   .create()
 *   .then(watcher => {
 *     watcher
 *       .on('disconnected', () => console.log('disconnected...'))
 *       .on('connected', () => console.log('successfully reconnected!'))
 *       .on('put', res => console.log('foo got set to:', res.value.toString()));
 *   });
 * ```
 */
class WatchBuilder {
    constructor(manager, namespace) {
        this.manager = manager;
        this.namespace = namespace;
        this.request = { progress_notify: true };
    }
    /**
     * Sets a single key to be watched.
     */
    key(key) {
        this.request.key = (0, util_1.toBuffer)(key);
        return this;
    }
    /**
     * Prefix instructs the watcher to watch all keys with the given prefix.
     */
    prefix(value) {
        return this.inRange(range_1.Range.prefix(value));
    }
    /**
     * inRange instructs the builder to watch keys in the specified byte range.
     */
    inRange(r) {
        const range = range_1.Range.from(r);
        this.request.key = range.start;
        this.request.range_end = range.end;
        return this;
    }
    /**
     * @deprecated this does the opposite of what it says -- use `only` instead
     */
    ignore(...operations) {
        return this.only(...operations);
    }
    /**
     * Requests only changes for the given kinds of operations.
     */
    only(...operations) {
        this.request.filters = operations.map(op => exports.operationNames[op]);
        return this;
    }
    /**
     * Instructs the watcher to return the previous key/value pair in updates.
     */
    withPreviousKV() {
        this.request.prev_kv = true;
        return this;
    }
    /**
     * Watch starting from a specific revision.
     */
    startRevision(revision) {
        this.request.start_revision = Number(revision);
        return this;
    }
    /**
     * watcher() creates but does not connect the watcher. Use create() instead;
     * this is mostly for testing purposes.
     * @private
     */
    watcher() {
        return new Watcher(this.manager, this.namespace, this.namespace.applyToRequest(this.request));
    }
    /**
     * Resolves the watch request into a Watcher, and fires off to etcd.
     */
    create() {
        const watcher = this.watcher();
        return Promise.race([
            (0, util_1.onceEvent)(watcher, 'connected').then(() => watcher),
            (0, util_1.onceEvent)(watcher, 'error').then(err => Promise.reject(err)),
        ]);
    }
}
exports.WatchBuilder = WatchBuilder;
/**
 * The Watcher is an event emitter that handles watching on a key or set
 * of keys. See {@link WatchBuilder} for a usage example.
 * @noInheritDoc
 */
class Watcher extends events_1.EventEmitter {
    /**
     * @internal
     */
    constructor(manager, namespace, request) {
        super();
        this.manager = manager;
        this.namespace = namespace;
        this.request = request;
        /**
         * id is the watcher's ID in etcd. This is `null` initially and during
         * reconnections, only populated while the watcher is idle.
         */
        this.id = null;
        this.manager.attach(this);
        this.on('data', changes => {
            changes.events.forEach(ev => {
                ev.kv.key = this.namespace.unprefix(ev.kv.key);
                if (ev.prev_kv) {
                    ev.prev_kv.key = this.namespace.unprefix(ev.prev_kv.key);
                }
                this.emit(ev.type.toLowerCase(), ev.kv, ev.prev_kv);
            });
            this.updateRevision(changes);
        });
        this.on('connected', changes => this.updateRevision(changes));
    }
    /**
     * Implements EventEmitter.on(...).
     */
    on(event, handler) {
        return super.on(event, handler);
    }
    /**
     * lastRevision returns the latest etcd cluster revision that this
     * watcher observed. This will be `null` if the watcher has not yet
     * connected.
     */
    lastRevision() {
        return this.request.start_revision;
    }
    /**
     * Cancels the watcher.
     */
    cancel() {
        return this.manager.detach(this);
    }
    /**
     * Updates the current revision based on the revision in the watch header.
     */
    updateRevision(req) {
        this.request.start_revision = new bignumber_js_1.default(req.header.revision).plus(1).toString();
    }
}
exports.Watcher = Watcher;
//# sourceMappingURL=watch.js.map