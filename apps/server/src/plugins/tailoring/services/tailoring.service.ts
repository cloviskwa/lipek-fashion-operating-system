import { Injectable } from '@nestjs/common';
import {
    AdministratorService,
    EventBus,
    ID,
    ListQueryBuilder,
    ListQueryOptions,
    PaginatedList,
    RequestContext,
    TransactionalConnection,
    User,
    UserInputError,
} from '@vendure/core';
import { In } from 'typeorm';
import { randomBytes } from 'crypto';

import { TailoringNotificationRecord } from '../entities/tailoring-notification-record.entity';
import { ProductionTimeline } from '../entities/production-timeline.entity';
import { TailoringConfiguration } from '../entities/tailoring-configuration.entity';
import { FittingAppointment } from '../entities/fitting-appointment.entity';
import { MeasurementProfile } from '../entities/measurement-profile.entity';
import { TailoringJob } from '../entities/tailoring-job.entity';
import { TailoringJobCreated } from '../events/tailoring-job-created.event';
import { TailoringStageTransitionEvent } from '../events/tailoring-stage-transition.event';
import { INITIAL_STAGE, TAILORING_STAGES, TailoringStage } from '../../../common/service-workflow/stage-definitions';
import { transition } from '../../../common/service-workflow/stage-machine';

export interface CreateJobInput {
    orderId: ID;
    customerId: ID;
    serviceName: string;
    jobNumber?: string | null;
    dueDate?: Date | null;
    assignedTailorId?: ID | null;
}

/**
 * The tailoring job aggregate (`R-06`): job creation, assignment,
 * cancellation, and — the heart of the module — production stage
 * transitions driven by the shared `stage-machine` engine (`ADR-0014`),
 * which validates the vocabulary, skips, the single backward transition,
 * per-transition permissions and cancellation, and returns the updated
 * timeline state plus whether the customer should be notified.
 */
@Injectable()
export class TailoringService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
        private eventBus: EventBus,
        private administratorService: AdministratorService,
    ) {}

    /**
     * Create a job with its one-to-one timeline starting at
     * `ORDER_CONFIRMED` (the stage machine's initial state).
     */
    async createJob(ctx: RequestContext, input: CreateJobInput): Promise<TailoringJob> {
        const job = await this.connection.getRepository(ctx, TailoringJob).save(
            new TailoringJob({
                jobNumber: input.jobNumber ?? this.generateJobNumber(),
                serviceName: input.serviceName,
                orderId: Number(input.orderId),
                customerId: Number(input.customerId),
                assignedTailorId: input.assignedTailorId != null ? Number(input.assignedTailorId) : null,
            }),
        );
        const now = new Date();
        const timeline = await this.connection.getRepository(ctx, ProductionTimeline).save(
            new ProductionTimeline({
                tailoringJobId: Number(job.id),
                currentStage: INITIAL_STAGE.tailoring,
                dueDate: input.dueDate ?? null,
                stageTimestamps: { [INITIAL_STAGE.tailoring]: now.toISOString() },
                stageActorIds: { [INITIAL_STAGE.tailoring]: String(ctx.activeUserId ?? 'system') },
            }),
        );
        await this.eventBus.publish(new TailoringJobCreated(ctx, job));
        // Attach so the mutation's response can include the timeline field.
        Object.assign(job, { timeline });
        return job;
    }

    /** Assign (or clear) the tailor responsible for operational stages. */
    async assignTailor(ctx: RequestContext, jobId: ID, tailorId: ID | null): Promise<TailoringJob> {
        const job = await this.getJob(ctx, jobId);
        job.assignedTailorId = tailorId != null ? Number(tailorId) : null;
        return this.connection.getRepository(ctx, TailoringJob).save(job);
    }

    /**
     * Cancel the job. Orthogonal to the stages (ADR-0014 §4): `cancelledAt`
     * is stamped and the stage machine refuses every further transition.
     */
    async cancelJob(ctx: RequestContext, jobId: ID): Promise<TailoringJob> {
        const job = await this.getJob(ctx, jobId);
        if (job.cancelledAt) {
            throw new UserInputError('Job is already cancelled.');
        }
        job.cancelledAt = new Date();
        await this.connection.getRepository(ctx, TailoringJob).save(job);
        return job;
    }

    /**
     * Advance the job's production to `to`. Performs SOT §9A end to end:
     * validates state and permissions via the stage machine, records
     * timestamp and actor, and — when the target stage notifies — creates
     * the QUEUED customer notification record.
     */
    async transitionStage(ctx: RequestContext, jobId: ID, to: string): Promise<ProductionTimeline> {
        const timeline = await this.connection
            .getRepository(ctx, ProductionTimeline)
            .findOne({ where: { tailoringJobId: Number(jobId) }, relations: ['job'] });
        if (!timeline) {
            throw new UserInputError('Job has no production timeline.');
        }
        const job = timeline.job;
        const actor = await this.resolveActor(ctx);
        const result = transition({
            sequence: TAILORING_STAGES,
            state: {
                currentStage: timeline.currentStage as any,
                stageTimestamps: timeline.stageTimestamps ?? {},
                stageActorIds: timeline.stageActorIds ?? {},
            },
            to: to as any,
            actor,
            assignedStaffId: job?.assignedTailorId ?? null,
            cancelledAt: job?.cancelledAt ?? null,
        });
        if (!result.ok) {
            throw new UserInputError(result.message);
        }
        const fromStage = timeline.currentStage;
        timeline.currentStage = result.state.currentStage;
        timeline.stageTimestamps = result.state.stageTimestamps;
        timeline.stageActorIds = result.state.stageActorIds;
        await this.connection.getRepository(ctx, ProductionTimeline).save(timeline);
        await this.eventBus.publish(
            new TailoringStageTransitionEvent(
                ctx,
                job as TailoringJob,
                timeline,
                fromStage as TailoringStage,
                to as TailoringStage,
                result.notifiesCustomer,
            ),
        );
        if (result.notifiesCustomer) {
            await this.queueCustomerNotification(ctx, job as TailoringJob, fromStage as TailoringStage, to);
        }
        return timeline;
    }

    async job(ctx: RequestContext, id: ID): Promise<TailoringJob | undefined> {
        const job = await this.connection.getRepository(ctx, TailoringJob).findOne({ where: { id } });
        if (!job) {
            return undefined;
        }
        await this.attachRelations(ctx, [job]);
        return job;
    }

    async jobs(
        ctx: RequestContext,
        options?: ListQueryOptions<TailoringJob>,
        filter: { customerId?: ID; orderId?: ID; assignedTailorId?: ID } = {},
    ): Promise<PaginatedList<TailoringJob>> {
        const qb = this.listQueryBuilder.build(TailoringJob, options ?? undefined, { ctx });
        if (filter.customerId != null) {
            qb.andWhere('job.customerId = :customerId', { customerId: filter.customerId });
        }
        if (filter.orderId != null) {
            qb.andWhere('job.orderId = :orderId', { orderId: filter.orderId });
        }
        if (filter.assignedTailorId != null) {
            qb.andWhere('job.assignedTailorId = :assignedTailorId', { assignedTailorId: filter.assignedTailorId });
        }
        const [items, totalItems] = await qb.getManyAndCount();
        await this.attachRelations(ctx, items);
        return { items, totalItems };
    }

    /**
     * Attach the job's satellite documents (configuration, timeline,
     * measurements, fittings) with one query per collection — the SDL
     * exposes them on the job type and GraphQL resolves them from these
     * plain properties.
     */
    private async attachRelations(ctx: RequestContext, jobs: TailoringJob[]): Promise<void> {
        if (jobs.length === 0) {
            return;
        }
        const ids = jobs.map(job => Number(job.id));
        const [configurations, timelines, fittings, profiles] = await Promise.all([
            this.connection.getRepository(ctx, TailoringConfiguration).find({ where: { tailoringJobId: In(ids) } }),
            this.connection.getRepository(ctx, ProductionTimeline).find({ where: { tailoringJobId: In(ids) } }),
            this.connection.getRepository(ctx, FittingAppointment).find({ where: { tailoringJobId: In(ids) } }),
            this.connection.getRepository(ctx, MeasurementProfile).find({ where: { tailoringJobId: In(ids) } }),
        ]);
        for (const job of jobs) {
            const id = Number(job.id);
            Object.assign(job, {
                configuration: configurations.find(config => config.tailoringJobId === id) ?? null,
                timeline: timelines.find(timeline => timeline.tailoringJobId === id) ?? null,
                fittings: fittings.filter(fitting => fitting.tailoringJobId === id),
                measurementProfile: profiles.find(profile => profile.tailoringJobId === id) ?? null,
            });
        }
    }

    async timelineFor(ctx: RequestContext, jobId: ID): Promise<ProductionTimeline | undefined> {
        return (
            (await this.connection
                .getRepository(ctx, ProductionTimeline)
                .findOne({ where: { tailoringJobId: Number(jobId) } })) ?? undefined
        );
    }

    /** Staff set quality control's verdict (stage 10 of the sequence). */
    async setQualityControl(ctx: RequestContext, jobId: ID, passed: boolean): Promise<ProductionTimeline> {
        const timeline = await this.timelineFor(ctx, jobId);
        if (!timeline) {
            throw new UserInputError('Job has no production timeline.');
        }
        timeline.qualityControlPassed = passed;
        await this.connection.getRepository(ctx, ProductionTimeline).save(timeline);
        return timeline;
    }

    private async getJob(ctx: RequestContext, id: ID): Promise<TailoringJob> {
        const job = await this.connection.getRepository(ctx, TailoringJob).findOne({ where: { id } });
        if (!job) {
            throw new UserInputError('Unknown tailoring job.');
        }
        return job;
    }

    /**
     * Resolve the acting administrator and whether they are a supervisor
     * (ADR-0014 §5.4: supervisors may advance any job). Supervisor here means
     * the super-admin role or the tailoring-manager role code; the mapping
     * grows with `SEC-006`'s role catalog.
     */
    private async resolveActor(ctx: RequestContext): Promise<{ administratorId: ID; isSupervisor: boolean }> {
        if (ctx.activeUserId == null) {
            throw new UserInputError('Only authenticated staff can advance production stages.');
        }
        const administrator = await this.administratorService.findOneByUserId(ctx, ctx.activeUserId);
        if (!administrator) {
            throw new UserInputError('Only authenticated staff can advance production stages.');
        }
        const user = await this.connection.getRepository(ctx, User).findOne({
            where: { id: ctx.activeUserId },
            relations: ['roles'],
        });
        const codes = (user?.roles ?? []).map(role => role.code);
        return {
            administratorId: administrator.id,
            isSupervisor: codes.includes('super-admin') || codes.includes('tailoring-manager'),
        };
    }

    private async queueCustomerNotification(
        ctx: RequestContext,
        job: TailoringJob,
        fromStage: string,
        toStage: string,
    ): Promise<void> {
        await this.connection.getRepository(ctx, TailoringNotificationRecord).save(
            new TailoringNotificationRecord({
                audience: 'customer',
                eventType: 'stage_advanced',
                fromStage,
                toStage,
                payload: JSON.stringify({ jobNumber: job.jobNumber, stage: toStage }),
                tailoringJobId: Number(job.id),
                recipientCustomerId: job.customerId,
            }),
        );
    }

    private generateJobNumber(): string {
        return `TJ-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`;
    }
}
