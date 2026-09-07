import { RequestContext, VendureEvent } from '@vendure/core';

import { AppointmentBooking } from '../entities/appointment-booking.entity';

/**
 * Published when a confirmed booking moves to a different slot (`R-05`).
 * `fromSlotId` is the slot vacated, `booking.activeSlotId` the slot now
 * occupied; the original `booking.slotId` never changes.
 */
export class AppointmentRescheduled extends VendureEvent {
    constructor(
        public readonly ctx: RequestContext,
        public readonly booking: AppointmentBooking,
        public readonly fromSlotId: number | string,
    ) {
        super();
    }
}
