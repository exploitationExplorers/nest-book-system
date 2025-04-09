/// <reference types="node" />
import * as grpc from '@grpc/grpc-js';
import { Range } from './range';
import { AuthClient, Permission } from './rpc';
/**
 * IPermission can be used to grant a certain role in etcd access to a certain
 * key range, or prefix.
 */
export type IPermissionRequest = {
    permission: keyof typeof Permission;
    range: Range;
} | {
    permission: keyof typeof Permission;
    key: Buffer | string;
};
/**
 * IGrant is used for granting a permission to a user.
 */
export interface IPermissionResult {
    permission: keyof typeof Permission;
    range: Range;
}
/**
 * The Role provides an entry point for managing etcd roles. Etcd has an
 * ACL-esque system: users have one or more roles, and roles have one or
 * more permissions that grant them access (read, write, or both) on key
 * ranges.
 */
export declare class Role {
    private client;
    readonly name: string;
    constructor(client: AuthClient, name: string);
    /**
     * Creates the role in etcd.
     */
    create(options?: grpc.CallOptions): Promise<this>;
    /**
     * Deletes the role from etcd.
     */
    delete(options?: grpc.CallOptions): Promise<this>;
    /**
     * Removes a permission from the role in etcd.
     */
    revoke(req: IPermissionRequest | IPermissionRequest[], options?: grpc.CallOptions): Promise<this>;
    /**
     * Grants one or more permissions to this role.
     */
    grant(req: IPermissionRequest | IPermissionRequest[], options?: grpc.CallOptions): Promise<this>;
    /**
     * Returns a list of permissions the role has.
     */
    permissions(options?: grpc.CallOptions): Promise<IPermissionResult[]>;
    /**
     * Grants a user access to the role.
     */
    addUser(user: string | User, options?: grpc.CallOptions): Promise<this>;
    /**
     * Removes a user's access to the role.
     */
    removeUser(user: string | User, options?: grpc.CallOptions): Promise<this>;
}
/**
 * The User provides an entry point for managing etcd users. The user can
 * be added to Roles to manage permissions.
 */
export declare class User {
    private client;
    readonly name: string;
    constructor(client: AuthClient, name: string);
    /**
     * Creates the user, with the provided password.
     */
    create(password: string, options?: grpc.CallOptions): Promise<this>;
    /**
     * Changes the user's password.
     */
    setPassword(password: string, options?: grpc.CallOptions): Promise<this>;
    /**
     * Deletes the user from etcd.
     */
    delete(options?: grpc.CallOptions): Promise<this>;
    /**
     * Returns a list of roles this user has.
     */
    roles(options?: grpc.CallOptions): Promise<Role[]>;
    /**
     * Adds the user to a role.
     */
    addRole(role: string | Role, options?: grpc.CallOptions): Promise<this>;
    /**
     * Removes the user's access to a role.
     */
    removeRole(role: string | Role, options?: grpc.CallOptions): Promise<this>;
}
