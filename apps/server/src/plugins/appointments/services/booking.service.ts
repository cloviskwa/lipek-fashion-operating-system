import { Injectable } from '@nestjs/common';
import { ID, EventBus, ListQueryBuilder, ListQueryOptions, PaginatedList, RequestContext, TransactionalConnection, UserInputError } from '@vendure/core';
import { In } from 'typeorm';

import {
    BOOKING_STATUS_CANCELLED,
    BOOKING_STATUS_COMPLETED,
    BOOKING_STATUS_CONFIRMED,
    BookingStatus,
    checkSlotForBooking,
    checkSlotForReschedule,
} from '../common/booking-rules';
import { AppointmentBooked } from '../events/appointment-booked.event';
import { AppointmentCancelled } from '../events/appointment-cancelled.event';
import { AppointmentCompleted } from '../events/appointment-completed.event';
import { AppointmentRescheduled } from '../events/appointment-rescheduled.event';
import { AppointmentBooking } from '../entities/appointment-booking.entity';
import { AppointmentSlot } from '../entities/appointment-slot.entity';

export interface BookSlotInput {
    slotId: ID;
    /** The booking customer, when made by/for a customer account. */
    customerId?: ID | null;
    /** Polymorphic subject (e.g. `tailoring_job`) for service-internal bookings. */
    subjectType?: string | null;
    subjectId?: string | null;
    notes?: string | null;
}

/**
 * The booking lifecycle (`R-05`): reserve → (reschedule)* → cancel |
 * complete, one transition at a time, each emitting its domain event.
 *
 * The double-booking guard is layered: the service checks occupancy for a
 * readable error, and the surviving schema's UNIQUE index on
 * `activeSlotId` is the final authority — a race between two concurrent
 * bookings loses at the database, not in application logic.
 */
@Injectable()
export class BookingService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
        private eventBus: EventBus,
    ) {}

    async book(ctx: RequestContext, input: BookSlotInput): Promise<AppointmentBooking> {
        const slot = await this.connection.getRepository(ctx, AppointmentSlot).findOne({
            where: { id: input.slotId },
            relations: ['resource'],
        });
        if (!slot) {
            throw new UserInputError('Unknown slot.');
        }
        const occupied = await this.isOccupied(ctx, slot.id);
        const check = checkSlotForBooking(slot, occupied, new Date());
        if (!check.ok) {
            throw new UserInputError(`Slot cannot be booked: ${check.reason}.`);
        }
        const repo = this.connection.getRepository(ctx, AppointmentBooking);
        const booking = await this.saveBookingGuarded(repo, () =>
            repo.save(
                new AppointmentBooking({
                    status: BOOKING_STATUS_CONFIRMED,
                    slotId: slot.id,
                    activeSlotId: slot.id,
                    resourceId: slot.resourceId,
                    customerId: input.customerId ?? null,
                    subjectType: input.subjectType ?? null,
                    subjectId: input.subjectId ?? null,
                    notes: input.notes ?? null,
                }),
            ),
        );
        await this.eventBus.publish(new AppointmentBooked(ctx, booking));
        return booking;
    }

    /** Cancel a confirmed booking: stamps `cancelledAt`, frees the slot. */
    async cancel(ctx: RequestContext, id: ID): Promise<AppointmentBooking> {
        const booking = await this.getConfirmed(ctx, id);
        booking.status = BOOKING_STATUS_CANCELLED;
        booking.cancelledAt = new Date();
        booking.activeSlotId = null;
        await this.connection.getRepository(ctx, AppointmentBooking).save(booking);
        await this.eventBus.publish(new AppointmentCancelled(ctx, booking));
        return booking;
    }

    /**
     * Move a confirmed booking to a different slot. The original `slotId`
     * is kept (the booking's history); `activeSlotId` and the denormalised
     * `resourceId` follow the new slot, and the vacated slot is free again.
     */
    async reschedule(ctx: RequestContext, id: ID, newSlotId: ID): Promise<AppointmentBooking> {
        const booking = await this.getConfirmed(ctx, id);
        const newSlot = await this.connection.getRepository(ctx, AppointmentSlot).findOne({
            where: { id: newSlotId },
            relations: ['resource'],
        });
        if (!newSlot) {
            throw new UserInputError('Unknown slot.');
        }
        const occupiedByOther = await this.isOccupied(ctx, newSlot.id);
        const check = checkSlotForReschedule(booking.activeSlotId, newSlot, occupiedByOther, new Date());
        if (!check.ok) {
            throw new UserInputError(`Slot cannot be booked: ${check.reason}.`);
        }
        const fromSlotId = booking.activeSlotId as ID;
        booking.activeSlotId = newSlot.id;
        booking.resourceId = newSlot.resourceId;
        await this.connection.getRepository(ctx, AppointmentBooking).save(booking);
        await this.eventBus.publish(new AppointmentRescheduled(ctx, booking, fromSlotId));
        return booking;
    }

    /** Staff close-out of a confirmed appointment. */
    async complete(ctx: RequestContext, id: ID): Promise<AppointmentBooking> {
        const booking = await this.getConfirmed(ctx, id);
        booking.status = BOOKING_STATUS_COMPLETED;
        await this.connection.getRepository(ctx, AppointmentBooking).save(booking);
        await this.eventBus.publish(new AppointmentCompleted(ctx, booking));
        return booking;
    }

    async booking(ctx: RequestContext, id: ID): Promise<AppointmentBooking | undefined> {
        return (
            (await this.connection.getRepository(ctx, AppointmentBooking).findOne({ where: { id } })) ?? undefined
        );
    }

    async bookings(
        ctx: RequestContext,
        options?: ListQueryOptions<AppointmentBooking>,
        filter: { customerId?: ID; subjectType?: string; subjectId?: string; statuses?: BookingStatus[] } = {},
    ): Promise<PaginatedList<AppointmentBooking>> {
        const qb = this.listQueryBuilder.build(AppointmentBooking, options ?? undefined, { ctx });
        if (filter.customerId != null) {
            qb.andWhere('booking.customerId = :customerId', { customerId: filter.customerId });
        }
        if (filter.subjectType != null) {
            qb.andWhere('booking.subjectType = :subjectType', { subjectType: filter.subjectType });
        }
        if (filter.subjectId != null) {
            qb.andWhere('booking.subjectId = :subjectId', { subjectId: filter.subjectId });
        }
        if (filter.statuses?.length) {
            qb.andWhere('booking.status IN (:...statuses)', { statuses: filter.statuses });
        }
        return qb.getManyAndCount().then(([items, totalItems]) => ({ items, totalItems }));
    }

    /**
     * Slots in a window that are active, in the future, and not occupied —
     * the storefront's bookable list.
     */
    async availableSlots(
        ctx: RequestContext,
        filter: { resourceId?: ID; from?: Date; to?: Date },
        options?: ListQueryOptions<AppointmentSlot>,
    ): Promise<PaginatedList<AppointmentSlot>> {
        const now = new Date();
        const from = filter.from ?? now;
        const slots = await this.connection.getRepository(ctx, AppointmentSlot).find({
            where: {
                isActive: true,
                ...(filter.resourceId != null ? { resourceId: filter.resourceId } : {}),
            },
            order: { startsAt: 'ASC' },
        });
        const occupied = await this.occupiedSlotIds(ctx, slots.map(slot => slot.id));
        const to = filter.to != null ? filter.to.getTime() : Infinity;
        const available = slots.filter(
            slot =>
                slot.startsAt.getTime() >= Math.max(from.getTime(), now.getTime()) &&
                slot.startsAt.getTime() <= to &&
                !occupied.has(String(slot.id)),
        );
        // Simple in-memory pagination over a bounded, ordered availability view.
        const take = options?.take ?? 100;
        const skip = options?.skip ?? 0;
        return { items: available.slice(skip, skip + take), totalItems: available.length };
    }

    private async occupiedSlotIds(ctx: RequestContext, slotIds: ID[]): Promise<Set<string>> {
        if (slotIds.length === 0) {
            return new Set();
        }
        const rows = await this.connection.getRepository(ctx, AppointmentBooking).find({
            where: { activeSlotId: In(slotIds.map(id => Number(id)) as number[]) },
            select: ['activeSlotId'],
        });
        return new Set(
            rows.map(row => row.activeSlotId).filter((id): id is ID => id != null).map(id => String(id)),
        );
    }

    private async isOccupied(ctx: RequestContext, slotId: ID): Promise<boolean> {
        const occupant = await this.connection.getRepository(ctx, AppointmentBooking).findOne({
            where: { activeSlotId: slotId as number },
        });
        return occupant != null;
    }

    private async getConfirmed(ctx: RequestContext, id: ID): Promise<AppointmentBooking> {
        const booking = await this.connection.getRepository(ctx, AppointmentBooking).findOne({ where: { id } });
        if (!booking) {
            throw new UserInputError('Unknown booking.');
        }
        if (booking.status !== BOOKING_STATUS_CONFIRMED) {
            throw new UserInputError(
                `Only confirmed bookings can change state (booking is ${booking.status}).`,
            );
        }
        return booking;
    }

    /**
     * The service-level occupancy check can race; the surviving schema's
     * UNIQUE index on activeSlotId is the final guard, and a lost race is
     * surfaced as the same user error a pre-check would have produced.
     */
    private async saveBookingGuarded(
        repo: ReturnType<TransactionalConnection['getRepository']>,
        save: () => Promise<AppointmentBooking>,
    ): Promise<AppointmentBooking> {
        try {
            return await save();
        } catch (e) {
            if (e instanceof Error && /duplicate key[\s\S]*activeSlotId/i.test(e.message)) {
                throw new UserInputError('Slot cannot be booked: SLOT_OCCUPIED.');
            }
            throw e;
        }
    }
}
