import { PermissionDefinition } from '@vendure/core';

/**
 * Read access to the security audit trail (`SEC-006`).
 *
 * Read-only by design — there is no create/update/delete counterpart because
 * the log is append-only and written by the server, never by an operator.
 * A `CrudPermissionDefinition` would imply write permissions that must not
 * exist.
 */
export const readAuditLogPermission = new PermissionDefinition({
    name: 'ReadAuditLog',
    description: 'Grants permission to read the LIPEK security audit log',
});
