import { CrudPermissionDefinition } from '@vendure/core';

/**
 * A single CRUD permission covering the appointment domain — resources,
 * slots and bookings (`R-05`).
 *
 * Mirrors the `Content` permission pattern from `R-02`: the SOT treats
 * appointment scheduling as one staff capability shared by the front-of-house
 * and service managers (SOT §22 has Tailoring Manager scheduling fittings;
 * the CRM pipeline books consultations), so per-entity splits would create
 * near-identical roles with no real boundary between them.
 *
 * Yields `CreateAppointment`, `ReadAppointment`, `UpdateAppointment` and
 * `DeleteAppointment`, assignable to roles in the Dashboard.
 */
export const appointmentPermission = new CrudPermissionDefinition(
    'Appointment',
    operation => `Grants permission to ${operation} LIPEK appointment resources, slots and bookings`,
);
