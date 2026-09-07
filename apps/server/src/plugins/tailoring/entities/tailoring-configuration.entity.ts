import { DeepPartial } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '@vendure/core';
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';

import { TailoringJob } from './tailoring-job.entity';

/**
 * The garment specification for one job (`R-06`; SOT §10.1's style/fabric/
 * options flow) — exactly one per job (UNIQUE `tailoringJobId` in the
 * surviving schema, the `REL_` unique constraint of a OneToOne relation).
 *
 * The option columns (`color`, `lapel`, `buttons`, `lining`, `monogram`)
 * mirror SOT §10.1's step list (02 POCKETS … 08 MONOGRAM) and stay free
 * strings: the catalogue of valid values is merchandising data, not schema.
 */
@Entity()
export class TailoringConfiguration extends VendureEntity {
    constructor(input?: DeepPartial<TailoringConfiguration>) {
        super(input);
    }

    @Index('IDX_feac7969129bbde0d62ebb3d8b', { unique: true })
    @OneToOne(() => TailoringJob, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tailoringJobId', foreignKeyConstraintName: 'FK_feac7969129bbde0d62ebb3d8bd' })
    job: TailoringJob;

    @Column({ type: 'int' })
    tailoringJobId: number;

    @Column()
    style: string;

    @Column()
    fit: string;

    @Column()
    fabric: string;

    @Column({ type: 'varchar', nullable: true })
    color: string | null;

    @Column({ type: 'varchar', nullable: true })
    lapel: string | null;

    @Column({ type: 'varchar', nullable: true })
    buttons: string | null;

    @Column({ type: 'varchar', nullable: true })
    lining: string | null;

    @Column({ type: 'varchar', nullable: true })
    monogram: string | null;

    @Column({ type: 'text', nullable: true })
    designNotes: string | null;

    /**
     * Customer-uploaded reference images (SOT §10.3), stored as a JSON array
     * of Vendure asset ids.
     */
    @Column({ type: 'simple-json', nullable: true })
    referenceImageAssetIds: number[] | null;
}
