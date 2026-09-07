import { DeepPartial } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '@vendure/core';
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';

import { TailoringJob } from './tailoring-job.entity';

/**
 * The production state of one job (`R-06`; SOT §10.2, §9A) — exactly one per
 * job (UNIQUE `tailoringJobId`).
 *
 * `currentStage` holds the `SCREAMING_SNAKE_CASE` identifier from
 * `TAILORING_STAGES` (ADR-0014 §1); the vocabulary is enforced in the
 * application layer on every write. `stageTimestamps` and `stageActorIds`
 * are JSON objects keyed by stage identifier (ADR-0014 §3): keys exist only
 * for stages actually reached, so a skipped stage stays distinguishable from
 * a pending one and the object itself is the audit trail.
 */
@Entity()
export class ProductionTimeline extends VendureEntity {
    constructor(input?: DeepPartial<ProductionTimeline>) {
        super(input);
    }

    /** The stage the job is at right now; the schema defaults to ORDER_CONFIRMED. */
    @Column({ default: 'ORDER_CONFIRMED' })
    currentStage: string;

    /** When the finished garment is due (SOT §22.2 "Due Date"). */
    @Column({ type: 'timestamp', nullable: true })
    dueDate: Date | null;

    /** JSON: `{ [stage]: ISO-8601 timestamp }` for every stage reached. */
    @Column({ type: 'simple-json', nullable: true })
    stageTimestamps: Record<string, string> | null;

    /** JSON: `{ [stage]: administratorId }` — who performed each transition. */
    @Column({ type: 'simple-json', nullable: true })
    stageActorIds: Record<string, string> | null;

    /** Free-form material notes (SOT §22.2 "Material requirements"). */
    @Column({ type: 'text', nullable: true })
    materialRequirements: string | null;

    /** Set when quality control has signed the garment off (stage 10). */
    @Column({ type: 'boolean', nullable: true })
    qualityControlPassed: boolean | null;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @Index('IDX_50bf687239933bf017cd1356d3', { unique: true })
    @OneToOne(() => TailoringJob, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tailoringJobId', foreignKeyConstraintName: 'FK_50bf687239933bf017cd1356d37' })
    job: TailoringJob;

    @Column({ type: 'int' })
    tailoringJobId: number;
}
