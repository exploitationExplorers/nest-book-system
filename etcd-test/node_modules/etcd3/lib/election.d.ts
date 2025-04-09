/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'events';
import { Namespace } from './namespace';
/**
 * Object returned from election.observer() that exposees information about
 * the current election.
 * @noInheritDoc
 */
export declare class ElectionObserver extends EventEmitter {
    private readonly namespace;
    /**
     * Gets whether the election has any leader.
     */
    get hasLeader(): boolean;
    private running;
    private runLoop;
    private disposer?;
    private current;
    constructor(namespace: Namespace);
    /**
     * change is fired when the elected value changes. It can be fired with
     * undefined if there's no longer a leader.
     */
    on(event: 'change', handler: (value: string | undefined) => void): this;
    /**
     * disconnected is fired when the underlying watcher is disconnected. Etcd3
     * will automatically attempt to reconnect in the background. This has the
     * same semantics as the `disconnected` event on the {@link Watcher}.
     */
    on(event: 'disconnected', handler: (value: Error) => void): this;
    /**
     * error is fired if the underlying election watcher
     * experiences an unrecoverable error.
     */
    on(event: 'error', handler: (value: Error) => void): this;
    /**
     * Closes the election observer.
     */
    cancel(): Promise<void>;
    /**
     * Returns the currently-elected leader value (passed to `campaign()` or
     * `proclaim()`), or undefined if there's no elected leader.
     */
    leader(encoding?: BufferEncoding): string | undefined;
    /**
     * Returns the currently-elected leader value (passed to `campaign()` or
     * `proclaim()`), or undefined if there's no elected leader.
     */
    leader(encoding: 'buffer'): Buffer | undefined;
    private setLeader;
    private loop;
}
/**
 * A Campaign is returned from {@link Election.campaign}. See the docs on that
 * method for an example.
 * @noInheritDoc
 */
export declare class Campaign extends EventEmitter {
    private readonly namespace;
    private lease;
    private keyRevision?;
    private value;
    private pendingProclaimation?;
    constructor(namespace: Namespace, value: string | Buffer, ttl: number);
    /**
     * elected is fired when the current instance becomes the leader.
     */
    on(event: 'elected', handler: () => void): this;
    /**
     * error is fired if the underlying lease experiences an error. When this
     * is emitted, the campaign has failed. You should handle this and create
     * a new campaign if appropriate.
     */
    on(event: 'error', handler: (error: Error) => void): this;
    /**
     * Helper function that returns a promise when the node becomes the leader.
     * If `resign()` is called before this happens, the promise never resolves.
     * If an error is emitted, the promise is rejected.
     */
    wait(): Promise<this>;
    /**
     * Updates the value announced by this candidate (without starting a new
     * election). If this candidate is currently the leader, then the change
     * will be seen on other consumers as well.
     *
     * @throws NotCampaigningError if the instance is no longer campaigning
     */
    proclaim(value: string | Buffer): Promise<void>;
    /**
     * Gets the etcd key in which the proclaimed value is stored. This is derived
     * from the underlying lease, and thus may throw if the lease was not granted
     * successfully.
     */
    getCampaignKey(): Promise<string>;
    /**
     * Resigns from the campaign. A new leader is elected if this instance was
     * formerly the leader.
     */
    resign(): Promise<void>;
    private start;
    private proclaimInner;
    private waitForElected;
}
/**
 * Implementation of elections, as seen in etcd's Go client. Elections are
 * most commonly used if you need a single server in charge of a certain task;
 * you run an election on every server where your program is running, and
 * among them they will choose one "leader".
 *
 * There are two main entrypoints: campaigning via {@link Election.campaign},
 * and observing the leader via {@link Election.observe}.
 *
 * @see https://github.com/etcd-io/etcd/blob/master/client/v3/concurrency/election.go
 *
 * @example
 *
 * ```js
 * const os = require('os');
 * const client = new Etcd3();
 * const election = client.election('singleton-job');
 *
 * function runCampaign() {
 *   const campaign = election.campaign(os.hostname())
 *   campaign.on('elected', () => {
 *     // This server is now the leader! Let's start doing work
 *     doSomeWork();
 *   });
 *   campaign.on('error', error => {
 *     // An error happened that caused our campaign to fail. If we were the
 *     // leader, make sure to stop doing work (another server is the leader
 *     // now) and create a new campaign.
 *     console.error(error);
 *     stopDoingWork();
 *     setTimeout(runCampaign, 5000);
 *   });
 * }
 *
 * async function observeLeader() {
 *   const observer = await election.observe();
 *   console.log('The current leader is', observer.leader());
 *   observer.on('change', leader => console.log('The new leader is', leader));
 *   observer.on('error', () => {
 *     // Something happened that fatally interrupted observation.
 *     setTimeout(observeLeader, 5000);
 *   });
 * }
 * ```
 * @noInheritDoc
 */
export declare class Election {
    readonly name: string;
    private readonly ttl;
    /**
     * Prefix used in the namespace for election-based operations.
     */
    static readonly prefix = "election";
    private readonly namespace;
    /**
     * @internal
     */
    constructor(parent: Namespace, name: string, ttl?: number);
    /**
     * Puts the value as eligible for election. Multiple sessions can participate
     * in the election, but only one can be the leader at a time.
     *
     * A common pattern in cluster-based applications is to campaign the hostname
     * or IP of the current server, and allow the leader server to be elected
     * among them.
     *
     * You should listen to the `error` and `elected` events on the returned
     * object to know when the instance becomes the leader, and when its campaign
     * fails. Once you're finished, you can use {@link Campaign.resign} to
     * forfeit its bid at leadership.
     *
     * Once acquired, instance will not lose its leadership unless `resign()`
     * is called, or `error` is emitted.
     */
    campaign(value: string): Campaign;
    /**
     * Returns the currently-elected leader value (passed to `campaign()` or
     * `proclaim()`), or undefined if there's no elected leader.
     */
    leader(encoding?: BufferEncoding): Promise<string | undefined>;
    /**
     * Returns the currently-elected leader value (passed to `campaign()` or
     * `proclaim()`), or undefined if there's no elected leader.
     */
    leader(encoding: 'buffer'): Promise<Buffer | undefined>;
    /**
     * Creates an observer for the election, which emits events when results
     * change. The observer must be closed using `observer.cancel()` when
     * you're finished with it.
     */
    observe(): Promise<ElectionObserver>;
}
