import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { EntityId, VendureEntity } from '@vendure/core';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AppointmentResource } from './appointment-resource.entity';

/**
 * A bookable window on a resource (`R-05`).
 *
 * Slots are **exclusive** by design: the booking side enforces one active
 * booking per slot (see `AppointmentBooking.activeSlotId`), and the schema
 * carries no capacity column — the surviving design books a slot to exactly
 * one party.
 */
@Entity()
export class AppointmentSlot extends VendureEntity {
    constructor(input?: DeepPartial<AppointmentSlot>) {
        super(input);
    }

    @Index('IDX_appointment_slot_startsAt')
    @Column({ type: 'timestamp' })
    startsAt: Date;

    @Column({ type: 'timestamp' })
    endsAt: Date;

    /** Deactivated slots stay in the calendar but cannot be booked. */
    @Column({ default: true })
    isActive: boolean;

    /**
     * Constraint names are pinned to the surviving schema's hand-named
     * constraints (rebuild-plan §4: the schema is authoritative over entity
     * metadata); the same applies to every explicit index name in this
     * plugin's entities.
     */
    @Index('IDX_appointment_slot_resourceId')
    @ManyToOne(() => AppointmentResource, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'resourceId', foreignKeyConstraintName: 'FK_appointment_slot_resourceId' })
    resource: AppointmentResource;

    @EntityId()
    resourceId: ID;
}
