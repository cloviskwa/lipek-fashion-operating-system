import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '@vendure/core';
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';

import { TailoringJob } from './tailoring-job.entity';

/**
 * A customer's body measurements (`R-06`; SOT §10.3 "measurement profiles",
 * "saved measurements").
 *
 * `tailoringJobId` is nullable: a profile taken during a consultation can
 * exist before any job does, and the same profile can later be attached to
 * the job it produced. When set it is UNIQUE (OneToOne) — a job has exactly
 * one measurement set. `measurements` holds the actual values as JSON
 * (`{ chest: 96, sleeve: 61, ... }`); `unit` (default `CM`) states how to
 * read them.
 */
@Entity()
export class MeasurementProfile extends VendureEntity {
    constructor(input?: DeepPartial<MeasurementProfile>) {
        super(input);
    }

    /** How to read the `measurements` values; the schema defaults to `CM`. */
    @Column({ default: 'CM' })
    unit: string;

    /** The measurements themselves, as a JSON object. */
    @Column({ type: 'text' })
    measurements: string;

    /** Where the values came from (e.g. `taken_in_store`, `customer_provided`). */
    @Column()
    source: string;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    /** Optional label ("wedding suit", "shirts") for a customer's profile list. */
    @Column({ type: 'varchar', nullable: true })
    label: string | null;

    @Index('IDX_069748c647c3f292a887a336bc', { unique: true })
    @OneToOne(() => TailoringJob, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tailoringJobId', foreignKeyConstraintName: 'FK_069748c647c3f292a887a336bc0' })
    job: TailoringJob | null;

    @Column({ type: 'int', nullable: true })
    tailoringJobId: number | null;

    /** The owning customer — plain column, no FK (surviving schema). */
    @Index('IDX_3c4fea05aba3957fd06550895c')
    @Column({ type: 'int' })
    customerId: number;

    /** The staff member (Administrator) who took the measurements, if any. */
    @Index('IDX_5303e2b3a6c5427ab3cc5a7db5')
    @Column({ type: 'int', nullable: true })
    takenById: number | null;

    /**
     * The appointment booking (AppointmentsPlugin) during which these
     * measurements were taken, when applicable.
     */
    @Index('IDX_measurement_profile_appointment_booking')
    @Column({ type: 'int', nullable: true })
    appointmentBookingId: number | null;
}
