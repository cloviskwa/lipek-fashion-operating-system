import { DeepPartial } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '@vendure/core';
import { Column, Entity, Index } from 'typeorm';

/**
 * A tailoring job — the aggregate root of the tailoring module (`R-06`;
 * SOT §10). One job per custom garment order line.
 *
 * Cross-module references (`orderId`, `customerId`, `depositPaymentId`,
 * `assignedTailorId`) are plain indexed columns without foreign keys: the
 * surviving schema deliberately keeps the tailoring tables decoupled from
 * commerce/core tables, so a job outlives changes elsewhere.
 *
 * Cancellation is the nullable `cancelledAt`, **not** a production stage
 * (ADR-0014 §4): the timeline preserves the stage the job had reached.
 */
@Entity()
export class TailoringJob extends VendureEntity {
    constructor(input?: DeepPartial<TailoringJob>) {
        super(input);
    }

    /** Stable human handle, e.g. shown on the job card and tracking page. */
    @Index('IDX_ec2510d09d250003b547d1ea17', { unique: true })
    @Column()
    jobNumber: string;

    /** The tailoring service purchased, e.g. "Three-Piece Suit" (SOT §22.2). */
    @Column()
    serviceName: string;

    /** The Vendure order that carries the commercial side of this job. */
    @Index('IDX_c8e94b12fd0b1ce15c66708acc')
    @Column({ type: 'int' })
    orderId: number;

    @Index('IDX_2ba4e7f8ff952432654edce65e')
    @Column({ type: 'int' })
    customerId: number;

    /** The deposit's payment entity, once the deposit stage (SOT §10.1/13) is paid. */
    @Index('IDX_9e71f9e7b07377b69fe92c7c9f')
    @Column({ type: 'int', nullable: true })
    depositPaymentId: number | null;

    /** The assigned tailor's Administrator id; NULL while unassigned. */
    @Index('IDX_04e11372d4cb95f03ba315be67')
    @Column({ type: 'int', nullable: true })
    assignedTailorId: number | null;

    /** Orthogonal to the production stages; blocks all further transitions. */
    @Column({ type: 'timestamp', nullable: true })
    cancelledAt: Date | null;
}
