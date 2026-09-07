import { Injectable } from '@nestjs/common';
import {
    ID,
    ListQueryBuilder,
    ListQueryOptions,
    PaginatedList,
    RequestContext,
    TransactionalConnection,
    UserInputError,
} from '@vendure/core';

import { FittingAppointment } from '../entities/fitting-appointment.entity';
import { TailoringJob } from '../entities/tailoring-job.entity';
import { FittingScheduled } from '../events/fitting-scheduled.event';
import { BookingService } from '../../appointments/services/booking.service';
import { EventBus } from '@vendure/core';

/** The fitting status vocabulary — the schema fixes only the default. */
export const FITTING_STATUS_SCHEDULED = 'SCHEDULED';
export const FITTING_STATUS_COMPLETED = 'COMPLETED';
export const FITTING_STATUS_CANCELLED = 'CANCELLED';
export const FITTING_STATUSES = [
    FITTING_STATUS_SCHEDULED,
    FITTING_STATUS_COMPLETED,
    FITTING_STATUS_CANCELLED,
] as const;

/**
 * Fitting appointments (`R-06`; SOT §10.2 First/Final Fitting). A job has
 * many; a failed fitting simply schedules the next one, and the production
 * stage machine — not the fitting status — owns the job's stage movement.
 *
 * When a bookable slot is supplied, the fitting reserves it through the
 * AppointmentsPlugin (`R-05`), linking the booking back to this job via the
 * `tailoring_job` subject pair.
 */
@Injectable()
export class FittingService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
        private eventBus: EventBus,
        /** The AppointmentsPlugin's booking service (provided by this plugin too). */
        private booker: BookingService,
    ) {}

    async schedule(
        ctx: RequestContext,
        input: {
            tailoringJobId: ID;
            fittingType: string;
            scheduledAt: Date;
            durationMinutes?: number | null;
            location?: string | null;
            assignedTailorId?: ID | null;
            notes?: string | null;
            /** Reserve this AppointmentsPlugin slot for the fitting. */
            bookSlotId?: ID | null;
        },
    ): Promise<FittingAppointment> {
        const job = await this.connection
            .getRepository(ctx, TailoringJob)
            .findOne({ where: { id: input.tailoringJobId } });
        if (!job) {
            throw new UserInputError('Unknown tailoring job.');
        }
        if (job.cancelledAt) {
            throw new UserInputError('Cannot schedule a fitting for a cancelled job.');
        }
        let appointmentBookingId: number | null = null;
        if (input.bookSlotId != null) {
            const booking = await this.booker.book(ctx, {
                slotId: input.bookSlotId,
                subjectType: 'tailoring_job',
                subjectId: String(job.id),
                notes: input.notes ?? null,
            });
            appointmentBookingId = Number(booking.id);
        }
        const fitting = await this.connection.getRepository(ctx, FittingAppointment).save(
            new FittingAppointment({
                tailoringJobId: job.id,
                fittingType: input.fittingType,
                scheduledAt: input.scheduledAt,
                durationMinutes: input.durationMinutes ?? 30,
                location: input.location ?? null,
                assignedTailorId: input.assignedTailorId != null ? Number(input.assignedTailorId) : null,
                notes: input.notes ?? null,
                appointmentBookingId,
            }),
        );
        await this.eventBus.publish(new FittingScheduled(ctx, job, fitting));
        return fitting;
    }

    /** Cancel a scheduled fitting; releases nothing here — the booking, if any, is cancelled via the appointments API. */
    async setStatus(ctx: RequestContext, id: ID, status: 'COMPLETED' | 'CANCELLED'): Promise<FittingAppointment> {
        const repo = this.connection.getRepository(ctx, FittingAppointment);
        const fitting = await repo.findOne({ where: { id } });
        if (!fitting) {
            throw new UserInputError('Unknown fitting.');
        }
        if (fitting.status !== FITTING_STATUS_SCHEDULED) {
            throw new UserInputError(`Only scheduled fittings can change state (fitting is ${fitting.status}).`);
        }
        fitting.status = status;
        return repo.save(fitting);
    }

    async fitting(ctx: RequestContext, id: ID): Promise<FittingAppointment | undefined> {
        return (
            (await this.connection.getRepository(ctx, FittingAppointment).findOne({ where: { id } })) ?? undefined
        );
    }

    async fittings(
        ctx: RequestContext,
        filter: { tailoringJobId?: ID; assignedTailorId?: ID },
        options?: ListQueryOptions<FittingAppointment>,
    ): Promise<PaginatedList<FittingAppointment>> {
        const qb = this.listQueryBuilder.build(FittingAppointment, options ?? undefined, { ctx });
        if (filter.tailoringJobId != null) {
            qb.andWhere('fitting.tailoringJobId = :tailoringJobId', { tailoringJobId: filter.tailoringJobId });
        }
        if (filter.assignedTailorId != null) {
            qb.andWhere('fitting.assignedTailorId = :assignedTailorId', {
                assignedTailorId: filter.assignedTailorId,
            });
        }
        return qb.getManyAndCount().then(([items, totalItems]) => ({ items, totalItems }));
    }
}
