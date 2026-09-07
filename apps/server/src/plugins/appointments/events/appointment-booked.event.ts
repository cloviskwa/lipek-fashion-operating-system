import { RequestContext, VendureEvent } from '@vendure/core';

import { AppointmentBooking } from '../entities/appointment-booking.entity';

/**
 * Published when a slot is newly reserved (`R-05`). Carries the booking
 * entity (id, status, slot/resource ids, customer/subject references) plus
 * the request context for actor attribution. Seed-list neighbour:
 * `FittingScheduled` — which the tailoring plugin will emit when *its*
 * fittings book through this plugin.
 */
export class AppointmentBooked extends VendureEvent {
    constructor(public readonly ctx: RequestContext, public readonly booking: AppointmentBooking) {
        super();
    }
}
