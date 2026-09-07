import { DeepPartial } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '@vendure/core';
import { Column, Entity, Index } from 'typeorm';

/**
 * A bookable thing — a member of staff, a fitting room, a machine
 * (`R-05`; SOT §0C "Appointment resources, slots, bookings").
 *
 * `resourceType` is deliberately a free string, not an enum: the surviving
 * schema has no vocabulary for it (indexed varchar, no CHECK, no rows), and
 * the kinds of bookable resources will grow with the service plugins
 * (fitting rooms, staff, delivery vehicles). Staff author the value.
 *
 * `code` is UNIQUE — it is the stable handle other plugins and the
 * storefront use to address a resource (e.g. "fitting-room-1") without
 * depending on autoincrement ids.
 */
@Entity()
export class AppointmentResource extends VendureEntity {
    constructor(input?: DeepPartial<AppointmentResource>) {
        super(input);
    }

    @Index('IDX_appointment_resource_code', { unique: true })
    @Column()
    code: string;

    @Column()
    name: string;

    @Index('IDX_appointment_resource_resourceType')
    @Column()
    resourceType: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    /** Deactivated resources keep their bookings but offer no new slots. */
    @Column({ default: true })
    isActive: boolean;
}
