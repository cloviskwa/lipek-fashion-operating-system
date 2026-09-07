import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { EntityId, VendureEntity } from '@vendure/core';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AppointmentResource } from './appointment-resource.entity';
import { AppointmentSlot } from './appointment-slot.entity';

/**
 * The reservation of one slot (`R-05`).
 *
 * The two slot references encode the booking's history:
 *
 * - `slotId` is the slot the booking **originally** reserved and never
 *   changes — rescheduling keeps it, so the original appointment remains
 *   traceable;
 * - `activeSlotId` is the slot the booking **currently** occupies. It is
 *   UNIQUE in the surviving schema, which is the database-level
 *   double-booking guard: two confirmed bookings can never target the same
 *   slot. Cancelling sets it to NULL (freeing the slot), rescheduling moves
 *   it to the new slot.
 *
 * The booking party is either a customer (`customerId`) or — for
 * staff-booked and service-internal appointments such as tailoring fittings
 * (SOT §10.2) — a polymorphic `subjectType`/`subjectId` pair pointing at the
 * owning entity (e.g. `tailoring_job`). Neither column carries a foreign key
 * in the surviving schema, by design: the booking must outlive the subject's
 * deletion and must not couple this plugin's tables to other plugins'.
 * `resourceId` is denormalised from the slot so bookings are queryable by
 * resource without traversing slots.
 */
@Entity()
export class AppointmentBooking extends VendureEntity {
    constructor(input?: DeepPartial<AppointmentBooking>) {
        super(input);
    }

    /**
     * Lifecycle vocabulary decided at rebuild (no CHECK constraint and no
     * rows survived): `CONFIRMED` is the schema's own default; `CANCELLED`
     * stamps `cancelledAt` and frees the slot; `COMPLETED` closes it out.
     * Transitions are validated in `booking-rules.ts`.
     */
    @Column({ default: 'CONFIRMED' })
    status: string;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    /** Set when the booking is cancelled; NULL otherwise. */
    @Column({ type: 'timestamp', nullable: true })
    cancelledAt: Date | null;

    /**
     * The originally booked slot — immutable for the life of the booking.
     */
    @Index('IDX_appointment_booking_slotId')
    @ManyToOne(() => AppointmentSlot, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'slotId', foreignKeyConstraintName: 'FK_appointment_booking_slotId' })
    slot: AppointmentSlot;

    @EntityId()
    slotId: ID;

    /**
     * The slot currently occupied. UNIQUE — the double-booking guard. NULL
     * once the booking is cancelled.
     */
    @Index('IDX_appointment_booking_activeSlotId', { unique: true })
    @Column({ type: 'int', nullable: true })
    activeSlotId: ID | null;

    /** Denormalised from the active slot; kept in step on reschedule. */
    @Index('IDX_appointment_booking_resourceId')
    @ManyToOne(() => AppointmentResource, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'resourceId', foreignKeyConstraintName: 'FK_appointment_booking_resourceId' })
    resource: AppointmentResource;

    @EntityId()
    resourceId: ID;

    /**
     * The booking customer, when the booking was made by/for a customer
     * account. No foreign key in the surviving schema — the booking must not
     * cascade or block customer deletion.
     */
    @Index('IDX_appointment_booking_customerId')
    @Column({ type: 'int', nullable: true })
    customerId: ID | null;

    /**
     * Polymorphic subject for service-internal appointments (e.g.
     * `subjectType: 'tailoring_job'` from the tailoring plugin's fittings).
     * Indexed separately to match the surviving schema.
     */
    @Index('IDX_appointment_booking_subjectType')
    @Column({ type: 'varchar', nullable: true })
    subjectType: string | null;

    @Index('IDX_appointment_booking_subjectId')
    @Column({ type: 'varchar', nullable: true })
    subjectId: string | null;
}
