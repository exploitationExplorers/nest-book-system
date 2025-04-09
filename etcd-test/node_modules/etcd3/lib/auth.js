"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.Role = void 0;
const range_1 = require("./range");
const util_1 = require("./util");
function getRange(req) {
    if (req.hasOwnProperty('key')) {
        return new range_1.Range((0, util_1.toBuffer)(req.key));
    }
    return req.range;
}
/**
 * The Role provides an entry point for managing etcd roles. Etcd has an
 * ACL-esque system: users have one or more roles, and roles have one or
 * more permissions that grant them access (read, write, or both) on key
 * ranges.
 */
class Role {
    constructor(client, name) {
        this.client = client;
        this.name = name;
    }
    /**
     * Creates the role in etcd.
     */
    create(options) {
        return this.client.roleAdd({ name: this.name }, options).then(() => this);
    }
    /**
     * Deletes the role from etcd.
     */
    delete(options) {
        return this.client.roleDelete({ role: this.name }, options).then(() => this);
    }
    /**
     * Removes a permission from the role in etcd.
     */
    revoke(req, options) {
        if (req instanceof Array) {
            return Promise.all(req.map(r => this.grant(r, options))).then(() => this);
        }
        const range = getRange(req);
        return this.client
            .roleRevokePermission({
            role: this.name,
            key: range.start,
            range_end: range.end,
        })
            .then(() => this);
    }
    /**
     * Grants one or more permissions to this role.
     */
    grant(req, options) {
        if (req instanceof Array) {
            return Promise.all(req.map(r => this.grant(r))).then(() => this);
        }
        const range = getRange(req);
        return this.client
            .roleGrantPermission({
            name: this.name,
            perm: {
                permType: req.permission,
                key: range.start,
                range_end: range.end,
            },
        }, options)
            .then(() => this);
    }
    /**
     * Returns a list of permissions the role has.
     */
    permissions(options) {
        return this.client.roleGet({ role: this.name }, options).then(response => {
            return response.perm.map(perm => ({
                permission: perm.permType,
                range: new range_1.Range(perm.key, perm.range_end),
            }));
        });
    }
    /**
     * Grants a user access to the role.
     */
    addUser(user, options) {
        if (user instanceof User) {
            user = user.name;
        }
        return this.client.userGrantRole({ user, role: this.name }, options).then(() => this);
    }
    /**
     * Removes a user's access to the role.
     */
    removeUser(user, options) {
        if (user instanceof User) {
            user = user.name;
        }
        return this.client.userRevokeRole({ name: user, role: this.name }, options).then(() => this);
    }
}
exports.Role = Role;
/**
 * The User provides an entry point for managing etcd users. The user can
 * be added to Roles to manage permissions.
 */
class User {
    constructor(client, name) {
        this.client = client;
        this.name = name;
    }
    /**
     * Creates the user, with the provided password.
     */
    create(password, options) {
        return this.client.userAdd({ name: this.name, password }, options).then(() => this);
    }
    /**
     * Changes the user's password.
     */
    setPassword(password, options) {
        return this.client.userChangePassword({ name: this.name, password }, options).then(() => this);
    }
    /**
     * Deletes the user from etcd.
     */
    delete(options) {
        return this.client.userDelete({ name: this.name }, options).then(() => this);
    }
    /**
     * Returns a list of roles this user has.
     */
    roles(options) {
        return this.client.userGet({ name: this.name }, options).then(res => {
            return res.roles.map(role => new Role(this.client, role));
        });
    }
    /**
     * Adds the user to a role.
     */
    addRole(role, options) {
        if (role instanceof Role) {
            role = role.name;
        }
        return this.client.userGrantRole({ user: this.name, role }, options).then(() => this);
    }
    /**
     * Removes the user's access to a role.
     */
    removeRole(role, options) {
        if (role instanceof Role) {
            role = role.name;
        }
        return this.client.userRevokeRole({ name: this.name, role }, options).then(() => this);
    }
}
exports.User = User;
//# sourceMappingURL=auth.js.map