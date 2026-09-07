import { RequestContext, VendureEvent } from '@vendure/core';

import { AppointmentBooking } from '../entities/appointment-booking.entity';

/**
 * Published when staff close out a confirmed appointment (`R-05`): status is
 * `COMPLETED`. The booking keeps its `activeSlotId` — the slot stays linked
 * to the appointment that used it.
 */
export class AppointmentCompleted extends VendureEvent {
    constructor(public readonly ctx: RequestContext, public readonly booking: AppointmentBooking) {
        super();
    }
}
