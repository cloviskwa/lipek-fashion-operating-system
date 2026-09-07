import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { EntityId, VendureEntity } from '@vendure/core';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { TailoringJob } from './tailoring-job.entity';

/**
 * A fitting appointment for one job (`R-06`; SOT §10.2's First/Final
 * Fitting stages). A job has **many** fittings — the first may fail and the
 * final fitting follow, and a failed final fitting returns the job to
 * `ADJUSTMENTS` (ADR-0014 §5.2), which schedules another one.
 *
 * `appointmentBookingId` links to the AppointmentsPlugin booking when the
 * fitting occupies a bookable slot: the fitting owns the *why*, the booking
 * owns the *when-and-where capacity*. Its lifecycle is independent — the
 * surviving schema carries no foreign key in either direction.
 */
@Entity()
export class FittingAppointment extends VendureEntity {
    constructor(input?: DeepPartial<FittingAppointment>) {
        super(input);
    }

    /** E.g. `FIRST_FITTING` / `FINAL_FITTING`. */
    @Column()
    fittingType: string;

    @Column({ type: 'timestamp' })
    scheduledAt: Date;

    /** Booking capacity is reserved for this long; the schema defaults to 30. */
    @Column({ default: 30 })
    durationMinutes: number;

    /** Where the fitting happens (studio address, or the customer's). */
    @Column({ type: 'varchar', nullable: true })
    location: string | null;

    /** `SCHEDULED` (schema default) → `COMPLETED` | `CANCELLED`. */
    @Column({ default: 'SCHEDULED' })
    status: string;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    /** The tailor conducting the fitting, when assigned. */
    @Index('IDX_c59a9b5a2123595891c2d1801c')
    @Column({ type: 'int', nullable: true })
    assignedTailorId: number | null;

    @Index('IDX_527a524ea5e14bc68fdbb08baf')
    @ManyToOne(() => TailoringJob, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tailoringJobId', foreignKeyConstraintName: 'FK_527a524ea5e14bc68fdbb08baf5' })
    job: TailoringJob;

    @EntityId()
    tailoringJobId: ID;

    /**
     * The AppointmentsPlugin booking holding the slot, when one was booked.
     */
    @Index('IDX_fitting_appointment_booking')
    @Column({ type: 'int', nullable: true })
    appointmentBookingId: number | null;
}
