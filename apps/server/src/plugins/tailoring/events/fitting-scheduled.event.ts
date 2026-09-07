import { RequestContext, VendureEvent } from '@vendure/core';

import { FittingAppointment } from '../entities/fitting-appointment.entity';
import { TailoringJob } from '../entities/tailoring-job.entity';

/**
 * Published when a fitting is scheduled for a job (`R-06`) — the seed-list
 * event, now real. When the fitting reserves a bookable slot, the
 * AppointmentsPlugin additionally publishes its own `AppointmentBooked`.
 */
export class FittingScheduled extends VendureEvent {
    constructor(
        public readonly ctx: RequestContext,
        public readonly job: TailoringJob,
        public readonly fitting: FittingAppointment,
    ) {
        super();
    }
}
