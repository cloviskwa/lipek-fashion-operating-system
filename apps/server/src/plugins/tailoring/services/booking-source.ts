/**
 * The `subjectType` value the tailoring plugin uses when it books capacity
 * through the AppointmentsPlugin (`R-06` × `R-05`): a fitting appointment
 * reserves a slot and the booking points back at the tailoring job through
 * `subjectType`/`subjectId` (the appointments schema's polymorphic pair).
 */
export const BOOKING_SOURCE_TYPE = 'tailoring_job';
