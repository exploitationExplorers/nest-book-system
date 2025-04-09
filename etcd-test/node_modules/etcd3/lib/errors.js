"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
exports.castGrpcError = exports.castGrpcErrorMessage = exports.STMConflictError = exports.NotCampaigningError = exports.EtcdWatchStreamEnded = exports.EtcdPermissionDeniedError = exports.EtcdInvalidAuthTokenError = exports.EtcdAuthenticationFailedError = exports.EtcdLockFailedError = exports.EtcdUserNotFoundError = exports.EtcdRoleNotFoundError = exports.EtcdRoleNotGrantedError = exports.EtcdUserExistsError = exports.EtcdRoleExistsError = exports.EtcdLeaseInvalidError = exports.EtcdError = exports.GRPCUnauthenticatedError = exports.GRPCUnavailableError = exports.GRPCDataLossError = exports.GRPCOutOfRangeError = exports.GRPCNotImplementedError = exports.GRPCAbortedError = exports.GRPCFailedPreconditionError = exports.GRPCResourceExhastedError = exports.GRPCAlreadyExistsError = exports.GRPCNotFoundError = exports.GRPCDeadlineExceededError = exports.GRPCInvalidArgumentError = exports.GRPCUnknownError = exports.GRPCCancelledError = exports.GRPCInternalError = exports.GRPCProtocolError = exports.GRPCGenericError = exports.isRecoverableError = exports.RecoverableError = exports.ClientClosedError = exports.ClientRuntimeError = void 0;
class ClientRuntimeError extends Error {
    constructor(message) {
        super(`${message} Please report this error at https://github.com/microsoft/etcd3`);
    }
}
exports.ClientRuntimeError = ClientRuntimeError;
/**
 * Thrown if a method is called after the client is closed.
 */
class ClientClosedError extends Error {
    constructor(namespace) {
        super(`Tried to call a ${namespace} method on etcd3, but the client was already closed`);
    }
}
exports.ClientClosedError = ClientClosedError;
/**
 * Symbol present on transient errors which will be resolved through default
 * fault handling.
 */
exports.RecoverableError = Symbol('RecoverableError');
/**
 * Returns whether the error is a network or server error that should trigger
 * fault-handling policies.
 */
const isRecoverableError = (error) => exports.RecoverableError in error;
exports.isRecoverableError = isRecoverableError;
/**
 * A GRPCGenericError is rejected via the connection when some error occurs
 * that we can't be more specific about.
 */
class GRPCGenericError extends Error {
}
exports.GRPCGenericError = GRPCGenericError;
/**
 * GRPCProtocolError is thrown when a protocol error occurs on the other end,
 * indicating that the external implementation is incorrect or incompatible.
 */
class GRPCProtocolError extends GRPCGenericError {
}
exports.GRPCProtocolError = GRPCProtocolError;
/**
 * GRPCInternalError is thrown when a internal error occurs on either end.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
class GRPCInternalError extends GRPCGenericError {
    constructor() {
        super(...arguments);
        this[_a] = true;
    }
}
exports.GRPCInternalError = GRPCInternalError;
_a = exports.RecoverableError;
/**
 * GRPCCancelledError is emitted when an ongoing call is cancelled.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
class GRPCCancelledError extends GRPCGenericError {
    constructor() {
        super(...arguments);
        this[_b] = true;
    }
}
exports.GRPCCancelledError = GRPCCancelledError;
_b = exports.RecoverableError;
/**
 * Unknown error.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
class GRPCUnknownError extends GRPCGenericError {
    constructor() {
        super(...arguments);
        this[_c] = true;
    }
}
exports.GRPCUnknownError = GRPCUnknownError;
_c = exports.RecoverableError;
/**
 * Client specified an invalid argument.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
class GRPCInvalidArgumentError extends GRPCGenericError {
}
exports.GRPCInvalidArgumentError = GRPCInvalidArgumentError;
/**
 * Deadline expired before operation could complete.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
class GRPCDeadlineExceededError extends GRPCGenericError {
    constructor() {
        super(...arguments);
        this[_d] = true;
    }
}
exports.GRPCDeadlineExceededError = GRPCDeadlineExceededError;
_d = exports.RecoverableError;
/**
 * Some requested entity (e.g., file or directory) was not found.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
class GRPCNotFoundError extends GRPCGenericError {
}
exports.GRPCNotFoundError = GRPCNotFoundError;
/**
 * Some entity that we attempted to create (e.g., file or directory) already exists.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
class GRPCAlreadyExistsError extends GRPCGenericError {
}
exports.GRPCAlreadyExistsError = GRPCAlreadyExistsError;
/**
 * Some resource has been exhausted, perhaps a per-user quota, or
 * perhaps the entire file system is out of space.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
class GRPCResourceExhastedError extends GRPCGenericError {
    constructor() {
        super(...arguments);
        this[_e] = true;
    }
}
exports.GRPCResourceExhastedError = GRPCResourceExhastedError;
_e = exports.RecoverableError;
/**
 * Operation was rejected because the system is not in a state
 * required for the operation's execution.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
class GRPCFailedPreconditionError extends GRPCGenericError {
}
exports.GRPCFailedPreconditionError = GRPCFailedPreconditionError;
/**
 * The operation was aborted, typically due to a concurrency issue
 * like sequencer check failures, transaction aborts, etc.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
class GRPCAbortedError extends GRPCGenericError {
    constructor() {
        super(...arguments);
        this[_f] = true;
    }
}
exports.GRPCAbortedError = GRPCAbortedError;
_f = exports.RecoverableError;
/**
 * Operation is not implemented or not supported/enabled in this service.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
class GRPCNotImplementedError extends GRPCGenericError {
}
exports.GRPCNotImplementedError = GRPCNotImplementedError;
/**
 * Operation was attempted past the valid range.  E.g., seeking or reading
 * past end of file.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
class GRPCOutOfRangeError extends GRPCGenericError {
}
exports.GRPCOutOfRangeError = GRPCOutOfRangeError;
/**
 * Unrecoverable data loss or corruption.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
class GRPCDataLossError extends GRPCGenericError {
}
exports.GRPCDataLossError = GRPCDataLossError;
/**
 * Unrecoverable data loss or corruption.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
class GRPCUnavailableError extends GRPCGenericError {
    constructor() {
        super(...arguments);
        this[_g] = true;
    }
}
exports.GRPCUnavailableError = GRPCUnavailableError;
_g = exports.RecoverableError;
/**
 * The request does not have valid authentication credentials for the operation.
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
class GRPCUnauthenticatedError extends GRPCGenericError {
}
exports.GRPCUnauthenticatedError = GRPCUnauthenticatedError;
/**
 * EtcdError is an application error returned by etcd.
 */
class EtcdError extends Error {
}
exports.EtcdError = EtcdError;
/**
 * EtcdLeaseInvalidError is thrown when trying to renew a lease that's
 * expired.
 */
class EtcdLeaseInvalidError extends Error {
    constructor(leaseID) {
        super(`Lease ${leaseID} is expired or revoked`);
    }
}
exports.EtcdLeaseInvalidError = EtcdLeaseInvalidError;
/**
 * EtcdRoleExistsError is thrown when trying to create a role that already exists.
 */
class EtcdRoleExistsError extends Error {
}
exports.EtcdRoleExistsError = EtcdRoleExistsError;
/**
 * EtcdUserExistsError is thrown when trying to create a user that already exists.
 */
class EtcdUserExistsError extends Error {
}
exports.EtcdUserExistsError = EtcdUserExistsError;
/**
 * EtcdRoleNotGrantedError is thrown when trying to revoke a role from a user
 * to which the role is not granted.
 */
class EtcdRoleNotGrantedError extends Error {
}
exports.EtcdRoleNotGrantedError = EtcdRoleNotGrantedError;
/**
 * EtcdRoleNotFoundError is thrown when trying to operate on a role that does
 * not exist.
 */
class EtcdRoleNotFoundError extends Error {
}
exports.EtcdRoleNotFoundError = EtcdRoleNotFoundError;
/**
 * EtcdUserNotFoundError is thrown when trying to operate on a user that does
 * not exist.
 */
class EtcdUserNotFoundError extends Error {
}
exports.EtcdUserNotFoundError = EtcdUserNotFoundError;
/**
 * EtcdLockFailedError is thrown when we fail to aquire a lock.
 */
class EtcdLockFailedError extends Error {
}
exports.EtcdLockFailedError = EtcdLockFailedError;
/**
 * EtcdAuthenticationFailedError is thrown when an invalid username/password
 * combination is submitted.
 *
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
class EtcdAuthenticationFailedError extends Error {
}
exports.EtcdAuthenticationFailedError = EtcdAuthenticationFailedError;
/**
 * EtcdInvalidAuthTokenError is thrown when an invalid or expired authentication
 * token is presented.
 */
class EtcdInvalidAuthTokenError extends Error {
}
exports.EtcdInvalidAuthTokenError = EtcdInvalidAuthTokenError;
/**
 * EtcdPermissionDeniedError is thrown when the user attempts to modify a key
 * that they don't have access to.
 *
 * Also can be emitted from GRPC.
 *
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
class EtcdPermissionDeniedError extends Error {
}
exports.EtcdPermissionDeniedError = EtcdPermissionDeniedError;
/**
 * EtcdWatchStreamEnded is emitted when a watch stream closes gracefully.
 * This is an unexpected occurrence.
 *
 * @see https://github.com/microsoft/etcd3/issues/72#issuecomment-386851271
 */
class EtcdWatchStreamEnded extends Error {
    constructor() {
        super('The etcd watch stream was unexpectedly ended');
    }
}
exports.EtcdWatchStreamEnded = EtcdWatchStreamEnded;
/**
 * Thrown from methods of {@link ElectionCampaign} if the campaign has ceased.
 */
class NotCampaigningError extends Error {
}
exports.NotCampaigningError = NotCampaigningError;
/**
 * An STMConflictError is thrown from the `SoftwareTransaction.transact`
 * if we continue to get conflicts and exceed the maximum number
 * of retries.
 */
class STMConflictError extends Error {
    constructor() {
        super('A conflict occurred executing the software transaction');
    }
}
exports.STMConflictError = STMConflictError;
/**
 * Mapping of GRPC error messages to typed error. GRPC errors are untyped
 * by default and sourced from within a mess of C code.
 */
const grpcMessageToError = new Map([
    ['etcdserver: role name already exists', EtcdRoleExistsError],
    ['etcdserver: user name already exists', EtcdUserExistsError],
    ['etcdserver: role is not granted to the user', EtcdRoleNotGrantedError],
    ['etcdserver: role name not found', EtcdRoleNotFoundError],
    ['etcdserver: user name not found', EtcdUserNotFoundError],
    ['etcdserver: authentication failed, invalid user ID or password', EtcdAuthenticationFailedError],
    ['etcdserver: permission denied', EtcdPermissionDeniedError],
    ['etcdserver: invalid auth token', EtcdInvalidAuthTokenError],
    ['etcdserver: requested lease not found', EtcdLeaseInvalidError],
]);
/**
 * Error code mapping
 * @see https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
const grpcCodeToError = new Map([
    [1, GRPCCancelledError],
    [2, GRPCUnknownError],
    [3, GRPCInvalidArgumentError],
    [4, GRPCDeadlineExceededError],
    [5, GRPCNotFoundError],
    [6, GRPCAlreadyExistsError],
    [7, EtcdPermissionDeniedError],
    [8, GRPCResourceExhastedError],
    [9, GRPCFailedPreconditionError],
    [10, GRPCAbortedError],
    [11, GRPCOutOfRangeError],
    [12, GRPCNotImplementedError],
    [13, GRPCInternalError],
    [14, GRPCUnavailableError],
    [15, GRPCDataLossError],
    [16, GRPCUnauthenticatedError],
]);
function getMatchingGrpcError(message) {
    for (const [key, value] of grpcMessageToError) {
        if (message.includes(key)) {
            return value;
        }
    }
    return undefined;
}
function rewriteErrorName(str, ctor) {
    return str.replace(/^Error:/, `${ctor.name}:`);
}
/**
 * Tries to convert an Etcd error string to an etcd error.
 */
function castGrpcErrorMessage(message) {
    const ctor = getMatchingGrpcError(message) || EtcdError;
    return new ctor(message);
}
exports.castGrpcErrorMessage = castGrpcErrorMessage;
/**
 * Tries to convert GRPC's generic, untyped errors to typed errors we can
 * consume. Yes, this method is abhorrent.
 */
function castGrpcError(err) {
    if (err.constructor !== Error) {
        return err; // it looks like it's already some kind of typed error
    }
    let ctor = getMatchingGrpcError(err.message);
    if (!ctor && 'code' in err && typeof err.code === 'number') {
        ctor = grpcCodeToError.get(err.code);
    }
    if (!ctor) {
        ctor = err.message.includes('etcdserver:') ? EtcdError : GRPCGenericError;
    }
    const castError = new ctor(rewriteErrorName(err.message, ctor));
    castError.stack = rewriteErrorName(String(err.stack), ctor);
    return castError;
}
exports.castGrpcError = castGrpcError;
//# sourceMappingURL=errors.js.map