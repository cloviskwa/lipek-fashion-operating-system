import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, ID, RequestContext, UserInputError } from '@vendure/core';

import { tailoringPermission } from '../tailoring-permissions';
import { MeasurementService } from '../services/measurement.service';
import { FittingService } from '../services/fitting.service';
import { TailoringService } from '../services/tailoring.service';

function parseFittingStatus(status: string): 'COMPLETED' | 'CANCELLED' {
    if (status !== 'COMPLETED' && status !== 'CANCELLED') {
        throw new UserInputError('Fitting status must be COMPLETED or CANCELLED.');
    }
    return status;
}

/**
 * Staff scheduling and workshop surface (`R-06`). Guarded by the `Tailoring`
 * CRUD permission; stage transitions go through the shared stage machine
 * (ADR-0014), which enforces vocabulary, skip/backward rules, per-transition
 * permissions and cancellation.
 */
@Resolver()
export class TailoringAdminResolver {
    constructor(
        private tailoringService: TailoringService,
        private measurementService: MeasurementService,
        private fittingService: FittingService,
    ) {}

    @Query()
    @Allow(tailoringPermission.Read)
    tailoringJobs(
        @Ctx() ctx: RequestContext,
        @Args() args: { customerId?: ID | null; orderId?: ID | null; assignedTailorId?: ID | null },
    ): Promise<any> {
        return this.tailoringService.jobs(ctx, undefined, {
            customerId: args.customerId ?? undefined,
            orderId: args.orderId ?? undefined,
            assignedTailorId: args.assignedTailorId ?? undefined,
        });
    }

    @Query()
    @Allow(tailoringPermission.Read)
    async tailoringJob(@Ctx() ctx: RequestContext, @Args('id') id: ID) {
        const job = await this.tailoringService.job(ctx, id);
        if (!job) {
            throw new UserInputError('Unknown tailoring job.');
        }
        return job;
    }

    @Query()
    @Allow(tailoringPermission.Read)
    fittings(
        @Ctx() ctx: RequestContext,
        @Args() args: { tailoringJobId?: ID | null; assignedTailorId?: ID | null },
    ): Promise<any> {
        return this.fittingService.fittings(ctx, {
            tailoringJobId: args.tailoringJobId ?? undefined,
            assignedTailorId: args.assignedTailorId ?? undefined,
        });
    }

    @Mutation()
    @Allow(tailoringPermission.Create)
    createTailoringJob(
        @Ctx() ctx: RequestContext,
        @Args('input') input: {
            orderId: ID;
            customerId: ID;
            serviceName: string;
            jobNumber?: string | null;
            dueDate?: Date | null;
            assignedTailorId?: ID | null;
        },
    ) {
        return this.tailoringService.createJob(ctx, input);
    }

    @Mutation()
    @Allow(tailoringPermission.Update)
    assignTailoringTailor(
        @Ctx() ctx: RequestContext,
        @Args('jobId') jobId: ID,
        @Args('tailorId', { nullable: true }) tailorId?: ID | null,
    ) {
        return this.tailoringService.assignTailor(ctx, jobId, tailorId ?? null);
    }

    @Mutation()
    @Allow(tailoringPermission.Update)
    cancelTailoringJob(@Ctx() ctx: RequestContext, @Args('id') id: ID) {
        return this.tailoringService.cancelJob(ctx, id);
    }

    @Mutation()
    @Allow(tailoringPermission.Update)
    transitionTailoringStage(
        @Ctx() ctx: RequestContext,
        @Args('jobId') jobId: ID,
        @Args('to') to: string,
    ) {
        return this.tailoringService.transitionStage(ctx, jobId, to);
    }

    @Mutation()
    @Allow(tailoringPermission.Update)
    setTailoringQualityControl(
        @Ctx() ctx: RequestContext,
        @Args('jobId') jobId: ID,
        @Args('passed') passed: boolean,
    ) {
        return this.tailoringService.setQualityControl(ctx, jobId, passed);
    }

    @Mutation()
    @Allow(tailoringPermission.Create)
    createMeasurementProfile(
        @Ctx() ctx: RequestContext,
        @Args('input') input: {
            customerId: ID;
            measurements: string;
            source: string;
            unit?: string | null;
            notes?: string | null;
            label?: string | null;
            tailoringJobId?: ID | null;
            takenById?: ID | null;
            appointmentBookingId?: ID | null;
        },
    ) {
        return this.measurementService.createProfile(ctx, input);
    }

    @Mutation()
    @Allow(tailoringPermission.Update)
    updateMeasurementProfile(
        @Ctx() ctx: RequestContext,
        @Args('id') id: ID,
        @Args('input') input: {
            measurements?: string | null;
            source?: string | null;
            unit?: string | null;
            notes?: string | null;
            label?: string | null;
        },
    ) {
        return this.measurementService.updateProfile(ctx, id, input);
    }

    @Mutation()
    @Allow(tailoringPermission.Create)
    scheduleFitting(
        @Ctx() ctx: RequestContext,
        @Args('input') input: {
            tailoringJobId: ID;
            fittingType: string;
            scheduledAt: Date;
            durationMinutes?: number | null;
            location?: string | null;
            assignedTailorId?: ID | null;
            notes?: string | null;
            bookSlotId?: ID | null;
        },
    ) {
        return this.fittingService.schedule(ctx, input);
    }

    @Mutation()
    @Allow(tailoringPermission.Update)
    setFittingStatus(@Ctx() ctx: RequestContext, @Args('id') id: ID, @Args('status') status: string) {
        return this.fittingService.setStatus(ctx, id, parseFittingStatus(status));
    }
}
