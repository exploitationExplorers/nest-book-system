export declare class ClientRuntimeError extends Error {
    constructor(message: string);
}
/**
 * Thrown if a method is called after the client is closed.
 */
export declare class ClientClosedError extends Error {
    constructor(namespace: string);
}
/**
 * Symbol present on transient errors which will be resolved through default
 * fault handling.
 */
export declare const RecoverableError: unique symbol;
/**
 * Returns whether the error is a network or server error that should trigger
 * fault-handling policies.
 */
export declare const isRecoverableError: (error: Error) => boolean;
/**
 * A GRPCGenericError is rejected via the connection when some error occurs
 * that we can't be more specific about.
 */
export declare class GRPCGenericError extends Error {
}
/**
 * GRPCProtocolError is thrown when a protocol error occurs on the other end,
 * indicating that the external implementation is incorrect or incompatible.
 */
export declare class GRPCProtocolError extends GRPCGenericError {
}
/**
 * GRPCInternalError is thrown when a internal error occurs on either end.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
export declare class GRPCInternalError extends GRPCGenericError {
    [RecoverableError]: boolean;
}
/**
 * GRPCCancelledError is emitted when an ongoing call is cancelled.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
export declare class GRPCCancelledError extends GRPCGenericError {
    [RecoverableError]: boolean;
}
/**
 * Unknown error.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
export declare class GRPCUnknownError extends GRPCGenericError {
    [RecoverableError]: boolean;
}
/**
 * Client specified an invalid argument.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
export declare class GRPCInvalidArgumentError extends GRPCGenericError {
}
/**
 * Deadline expired before operation could complete.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
export declare class GRPCDeadlineExceededError extends GRPCGenericError {
    [RecoverableError]: boolean;
}
/**
 * Some requested entity (e.g., file or directory) was not found.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
export declare class GRPCNotFoundError extends GRPCGenericError {
}
/**
 * Some entity that we attempted to create (e.g., file or directory) already exists.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
export declare class GRPCAlreadyExistsError extends GRPCGenericError {
}
/**
 * Some resource has been exhausted, perhaps a per-user quota, or
 * perhaps the entire file system is out of space.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
export declare class GRPCResourceExhastedError extends GRPCGenericError {
    [RecoverableError]: boolean;
}
/**
 * Operation was rejected because the system is not in a state
 * required for the operation's execution.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
export declare class GRPCFailedPreconditionError extends GRPCGenericError {
}
/**
 * The operation was aborted, typically due to a concurrency issue
 * like sequencer check failures, transaction aborts, etc.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
export declare class GRPCAbortedError extends GRPCGenericError {
    [RecoverableError]: boolean;
}
/**
 * Operation is not implemented or not supported/enabled in this service.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
export declare class GRPCNotImplementedError extends GRPCGenericError {
}
/**
 * Operation was attempted past the valid range.  E.g., seeking or reading
 * past end of file.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
export declare class GRPCOutOfRangeError extends GRPCGenericError {
}
/**
 * Unrecoverable data loss or corruption.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
export declare class GRPCDataLossError extends GRPCGenericError {
}
/**
 * Unrecoverable data loss or corruption.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
export declare class GRPCUnavailableError extends GRPCGenericError {
    [RecoverableError]: boolean;
}
/**
 * The request does not have valid authentication credentials for the operation.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
export declare class GRPCUnauthenticatedError extends GRPCGenericError {
}
/**
 * EtcdError is an application error returned by etcd.
 */
export declare class EtcdError extends Error {
}
/**
 * EtcdLeaseInvalidError is thrown when trying to renew a lease that's
 * expired.
 */
export declare class EtcdLeaseInvalidError extends Error {
    constructor(leaseID: string);
}
/**
 * EtcdRoleExistsError is thrown when trying to create a role that already exists.
 */
export declare class EtcdRoleExistsError extends Error {
}
/**
 * EtcdUserExistsError is thrown when trying to create a user that already exists.
 */
export declare class EtcdUserExistsError extends Error {
}
/**
 * EtcdRoleNotGrantedError is thrown when trying to revoke a role from a user
 * to which the role is not granted.
 */
export declare class EtcdRoleNotGrantedError extends Error {
}
/**
 * EtcdRoleNotFoundError is thrown when trying to operate on a role that does
 * not exist.
 */
export declare class EtcdRoleNotFoundError extends Error {
}
/**
 * EtcdUserNotFoundError is thrown when trying to operate on a user that does
 * not exist.
 */
export declare class EtcdUserNotFoundError extends Error {
}
/**
 * EtcdLockFailedError is thrown when we fail to aquire a lock.
 */
export declare class EtcdLockFailedError extends Error {
}
/**
 * EtcdAuthenticationFailedError is thrown when an invalid username/password
 * combination is submitted.
 *
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
export declare class EtcdAuthenticationFailedError extends Error {
}
/**
 * EtcdInvalidAuthTokenError is thrown when an invalid or expired authentication
 * token is presented.
 */
export declare class EtcdInvalidAuthTokenError extends Error {
}
/**
 * EtcdPermissionDeniedError is thrown when the user attempts to modify a key
 * that they don't have access to.
 *
 * Also can be emitted from GRPC.
 *
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
export declare class EtcdPermissionDeniedError extends Error {
}
/**
 * EtcdWatchStreamEnded is emitted when a watch stream closes gracefully.
 * This is an unexpected occurrence.
 *
 * @see https://github.com/microsoft/etcd3/issues/72#issuecomment-386851271
 */
export declare class EtcdWatchStreamEnded extends Error {
    constructor();
}
/**
 * Thrown from methods of {@link ElectionCampaign} if the campaign has ceased.
 */
export declare class NotCampaigningError extends Error {
}
/**
 * An STMConflictError is thrown from the `SoftwareTransaction.transact`
 * if we continue to get conflicts and exceed the maximum number
 * of retries.
 */
export declare class STMConflictError extends Error {
    constructor();
}
/**
 * Tries to convert an Etcd error string to an etcd error.
 */
export declare function castGrpcErrorMessage(message: string): Error;
/**
 * Tries to convert GRPC's generic, untyped errors to typed errors we can
 * consume. Yes, this method is abhorrent.
 */
export declare function castGrpcError<T extends Error>(err: T): Error;
