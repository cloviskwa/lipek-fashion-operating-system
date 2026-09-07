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

import { MeasurementProfile } from '../entities/measurement-profile.entity';
import { TailoringJob } from '../entities/tailoring-job.entity';

/**
 * Measurement profiles (`R-06`; SOT §10.3). A profile belongs to a customer
 * and optionally to the job it produced — the consultation can record
 * measurements before a job exists, and the storefront's "Use Saved
 * Measurements" (SOT §10.1/09) reads them by customer.
 */
@Injectable()
export class MeasurementService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
    ) {}

    async createProfile(
        ctx: RequestContext,
        input: {
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
    ): Promise<MeasurementProfile> {
        this.assertValidJson(input.measurements);
        let tailoringJobId: number | null = null;
        if (input.tailoringJobId != null) {
            const job = await this.connection
                .getRepository(ctx, TailoringJob)
                .findOne({ where: { id: input.tailoringJobId } });
            if (!job) {
                throw new UserInputError('Unknown tailoring job.');
            }
            // One profile per job: attaching to a job that already has one
            // would violate the surviving schema's UNIQUE constraint.
            const existing = await this.connection
                .getRepository(ctx, MeasurementProfile)
                .findOne({ where: { tailoringJobId: Number(input.tailoringJobId) } });
            if (existing) {
                throw new UserInputError('This job already has a measurement profile.');
            }
            tailoringJobId = Number(input.tailoringJobId);
        }
        return this.connection.getRepository(ctx, MeasurementProfile).save(
            new MeasurementProfile({
                customerId: Number(input.customerId),
                measurements: input.measurements,
                source: input.source,
                unit: input.unit ?? 'CM',
                notes: input.notes ?? null,
                label: input.label ?? null,
                tailoringJobId,
                takenById: input.takenById != null ? Number(input.takenById) : null,
                appointmentBookingId:
                    input.appointmentBookingId != null ? Number(input.appointmentBookingId) : null,
            }),
        );
    }

    async updateProfile(
        ctx: RequestContext,
        id: ID,
        input: Partial<{
            measurements?: string | null;
            source?: string | null;
            unit?: string | null;
            notes?: string | null;
            label?: string | null;
        }>,
    ): Promise<MeasurementProfile> {
        const repo = this.connection.getRepository(ctx, MeasurementProfile);
        const profile = await repo.findOne({ where: { id } });
        if (!profile) {
            throw new UserInputError('Unknown measurement profile.');
        }
        if (input.measurements != null) {
            this.assertValidJson(input.measurements);
        }
        Object.assign(profile, input, { id: profile.id });
        return repo.save(profile);
    }

    async profile(ctx: RequestContext, id: ID): Promise<MeasurementProfile | undefined> {
        return (
            (await this.connection.getRepository(ctx, MeasurementProfile).findOne({ where: { id } })) ?? undefined
        );
    }

    async profiles(
        ctx: RequestContext,
        options?: ListQueryOptions<MeasurementProfile>,
        filter: { customerId?: ID; tailoringJobId?: ID } = {},
    ): Promise<PaginatedList<MeasurementProfile>> {
        const qb = this.listQueryBuilder.build(MeasurementProfile, options ?? undefined, { ctx });
        if (filter.customerId != null) {
            qb.andWhere('profile.customerId = :customerId', { customerId: filter.customerId });
        }
        if (filter.tailoringJobId != null) {
            qb.andWhere('profile.tailoringJobId = :tailoringJobId', { tailoringJobId: filter.tailoringJobId });
        }
        return qb.getManyAndCount().then(([items, totalItems]) => ({ items, totalItems }));
    }

    /** Measurements are read as JSON everywhere; refuse to store non-JSON. */
    private assertValidJson(raw: string): void {
        try {
            const parsed = JSON.parse(raw);
            if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
                throw new Error('not an object');
            }
        } catch {
            throw new UserInputError('measurements must be a JSON object.');
        }
    }
}
