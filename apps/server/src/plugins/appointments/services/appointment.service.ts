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
import { In } from 'typeorm';

import { AppointmentBooking } from '../entities/appointment-booking.entity';
import { AppointmentResource } from '../entities/appointment-resource.entity';
import { AppointmentSlot } from '../entities/appointment-slot.entity';

/**
 * Management of appointment resources and their slots (`R-05`).
 *
 * Resources are never hard-deleted: the surviving schema cascades slot and
 * booking deletion through a resource delete, which would silently destroy
 * the appointment history. Deactivation (`isActive: false`) is the off
 * switch; a hard delete is a deliberate future decision.
 */
@Injectable()
export class AppointmentService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
    ) {}

    async createResource(
        ctx: RequestContext,
        input: { code: string; name: string; resourceType: string; description?: string | null },
    ): Promise<AppointmentResource> {
        const repo = this.connection.getRepository(ctx, AppointmentResource);
        const existing = await repo.findOne({ where: { code: input.code } });
        if (existing) {
            throw new UserInputError(`A resource with code "${input.code}" already exists.`);
        }
        return repo.save(
            new AppointmentResource({
                code: input.code,
                name: input.name,
                resourceType: input.resourceType,
                description: input.description ?? null,
            }),
        );
    }

    async updateResource(
        ctx: RequestContext,
        id: ID,
        input: Partial<{ code: string; name: string; resourceType: string; description: string | null; isActive: boolean }>,
    ): Promise<AppointmentResource> {
        const repo = this.connection.getRepository(ctx, AppointmentResource);
        const resource = await repo.findOne({ where: { id } });
        if (!resource) {
            throw new UserInputError('Unknown resource.');
        }
        if (input.code && input.code !== resource.code) {
            const clash = await repo.findOne({ where: { code: input.code } });
            if (clash) {
                throw new UserInputError(`A resource with code "${input.code}" already exists.`);
            }
        }
        Object.assign(resource, {
            ...input,
            id: resource.id,
        });
        return repo.save(resource);
    }

    async resources(ctx: RequestContext, options?: ListQueryOptions<AppointmentResource>) {
        return this.listQueryBuilder
            .build(AppointmentResource, options ?? undefined, { ctx })
            .getManyAndCount()
            .then(([items, totalItems]) => ({ items, totalItems }));
    }

    async resource(ctx: RequestContext, id: ID): Promise<AppointmentResource | undefined> {
        return (
            (await this.connection.getRepository(ctx, AppointmentResource).findOne({ where: { id } })) ?? undefined
        );
    }

    /**
     * Create a bookable window. Past windows may be recorded (for history),
     * but the booking rules refuse to reserve them.
     */
    async createSlot(
        ctx: RequestContext,
        input: { resourceId: ID; startsAt: Date; endsAt: Date },
    ): Promise<AppointmentSlot> {
        if (input.startsAt.getTime() >= input.endsAt.getTime()) {
            throw new UserInputError('A slot must start before it ends.');
        }
        const resource = await this.connection.getRepository(ctx, AppointmentResource).findOne({
            where: { id: input.resourceId },
        });
        if (!resource) {
            throw new UserInputError('Unknown resource.');
        }
        return this.connection
            .getRepository(ctx, AppointmentSlot)
            .save(new AppointmentSlot({ resourceId: resource.id, startsAt: input.startsAt, endsAt: input.endsAt }));
    }

    /** Activate/deactivate a slot. Deactivated slots cannot be booked. */
    async setSlotActive(ctx: RequestContext, id: ID, isActive: boolean): Promise<AppointmentSlot> {
        const repo = this.connection.getRepository(ctx, AppointmentSlot);
        const slot = await repo.findOne({ where: { id } });
        if (!slot) {
            throw new UserInputError('Unknown slot.');
        }
        slot.isActive = isActive;
        return repo.save(slot);
    }

    /**
     * Slots of a resource in a time window. Occupancy is *not* filtered here —
     * the calendar needs to show booked and free slots; callers mark the
     * booked ones or use `availableSlots` for the storefront's bookable list.
     */
    async slots(
        ctx: RequestContext,
        filter: { resourceId?: ID; from?: Date; to?: Date },
        options?: ListQueryOptions<AppointmentSlot>,
    ): Promise<PaginatedList<AppointmentSlot>> {
        const qb = this.listQueryBuilder.build(AppointmentSlot, options ?? undefined, { ctx });
        if (filter.resourceId != null) {
            qb.andWhere('slot.resourceId = :resourceId', { resourceId: filter.resourceId });
        }
        if (filter.from != null) {
            qb.andWhere('slot.startsAt >= :from', { from: filter.from });
        }
        if (filter.to != null) {
            qb.andWhere('slot.startsAt <= :to', { to: filter.to });
        }
        return qb.getManyAndCount().then(([items, totalItems]) => ({ items, totalItems }));
    }

    async slot(ctx: RequestContext, id: ID): Promise<AppointmentSlot | undefined> {
        return (await this.connection.getRepository(ctx, AppointmentSlot).findOne({ where: { id } })) ?? undefined;
    }

    /**
     * Ids of slots currently occupied by an active booking — the storefront
     * marks these unavailable in the calendar.
     */
    async occupiedSlotIds(ctx: RequestContext, slotIds: ID[]): Promise<Set<ID>> {
        if (slotIds.length === 0) {
            return new Set();
        }
        const rows = await this.connection.getRepository(ctx, AppointmentBooking).find({
            where: { activeSlotId: In(slotIds.map(id => Number(id)) as number[]) },
            select: ['activeSlotId'],
        });
        return new Set(rows.map(row => row.activeSlotId).filter((id): id is ID => id != null));
    }
}
