import { RequestContext, VendureEvent } from '@vendure/core';

import { AppointmentBooking } from '../entities/appointment-booking.entity';

/**
 * Published when a confirmed booking is cancelled (`R-05`): status is
 * `CANCELLED`, `cancelledAt` is stamped and `activeSlotId` is NULL — the
 * slot is free again.
 */
export class AppointmentCancelled extends VendureEvent {
    constructor(
        public readonly ctx: RequestContext,
        public readonly booking: AppointmentBooking,
    ) {
        super();
    }
}
