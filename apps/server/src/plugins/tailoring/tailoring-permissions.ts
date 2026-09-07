import { CrudPermissionDefinition } from '@vendure/core';

/**
 * A single CRUD permission for the tailoring domain (`R-06`) — jobs,
 * configurations, measurements, the production timeline and fittings. Per
 * SOT §22 the Tailoring Manager owns the queue and fittings; one permission
 * mirrors that capability, as with `Content` (R-02) and `Appointment` (R-05).
 *
 * Yields `CreateTailoring`, `ReadTailoring`, `UpdateTailoring`,
 * `DeleteTailoring`.
 */
export const tailoringPermission = new CrudPermissionDefinition(
    'Tailoring',
    operation => `Grants permission to ${operation} LIPEK tailoring jobs and fittings`,
);
