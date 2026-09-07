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

/**
 * Support-flow permission for issuing MFA recovery codes to locked-out
 * users (`SEC-004`). Deliberately separate from the superadmin builtin: the
 * least-privileged role that can run MFA recovery should be grantable on its
 * own, and its use is auditable through the shared audit trail.
 */
export const manageMfaRecoveryPermission = new PermissionDefinition({
    name: 'ManageMfaRecovery',
    description: 'Grants permission to issue MFA recovery codes for locked-out users',
});
