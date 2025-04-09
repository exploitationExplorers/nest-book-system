import * as grpc from '@grpc/grpc-js';
import { IDefaultPolicyContext, IPolicy } from 'cockatiel';
import { IOptions } from './options';
import { ICallable, Services } from './rpc';
/**
 * A Host is one instance of the etcd server, which can contain multiple
 * services. It holds GRPC clients to communicate with the host, and will
 * be removed from the connection pool upon server failures.
 */
export declare class Host {
    private readonly channelCredentials;
    private readonly channelOptions?;
    readonly faultHandling: IPolicy<IDefaultPolicyContext>;
    private readonly host;
    private closed;
    private cachedServices;
    constructor(host: string, channelCredentials: grpc.ChannelCredentials, channelOptions?: grpc.ChannelOptions | undefined, faultHandling?: IPolicy<IDefaultPolicyContext>);
    /**
     * Returns the given GRPC service on the current host.
     */
    getServiceClient(name: keyof typeof Services): grpc.Client;
    /**
     * Closes the all clients for the given host, allowing them to be
     * reestablished on subsequent calls.
     */
    resetAllServices(): void;
    /**
     * Close frees resources associated with the host, tearing down any
     * existing client
     */
    close(): void;
}
/**
 * Connection wraps GRPC hosts. Note that this wraps the hosts themselves; each
 * host can contain multiple discreet services.
 */
export declare class ConnectionPool implements ICallable<Host> {
    private readonly options;
    /**
     * Toggles whether hosts are looped through in a deterministic order.
     * For use in tests, should not be toggled in production/
     */
    static deterministicOrder: boolean;
    readonly callOptionsFactory: import("./options").CallOptionsFactory | undefined;
    private readonly hosts;
    private readonly globalPolicy;
    private mockImpl;
    private authenticator;
    constructor(options: IOptions);
    /**
     * Sets a mock interface to use instead of hitting real services.
     */
    mock(callable: ICallable<Host>): void;
    /**
     * Removes any existing mock.
     */
    unmock(): void;
    /**
     * Tears down all ongoing connections and resoruces.
     */
    close(): void;
    /**
     * @override
     */
    exec<T>(serviceName: keyof typeof Services, method: string, payload: unknown, options?: grpc.CallOptions): Promise<T>;
    /**
     * @override
     */
    withConnection<T>(service: keyof typeof Services, fn: (args: {
        resource: Host;
        client: grpc.Client;
        metadata: grpc.Metadata;
    }) => Promise<T> | T, shuffleGenerator?: Generator<Host, void, unknown>): Promise<T>;
    /**
     * @override
     */
    markFailed(resource: Host, error: Error): void;
    /**
     * A generator function that endlessly loops through hosts in a
     * fisher-yates shuffle for each iteration.
     */
    private shuffledHosts;
    /**
     * Creates authentication credentials to use for etcd clients.
     */
    private buildAuthentication;
    /**
     * Returns whether any configured host is set up to use TLS.
     */
    private hasSecureHost;
}
