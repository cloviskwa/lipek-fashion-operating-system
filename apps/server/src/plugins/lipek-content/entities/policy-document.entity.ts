import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { EntityId, VendureEntity } from '@vendure/core';
import { Column, Entity, Index } from 'typeorm';

import { ContentStatus } from './content-status';

/** A legal/policy document (privacy, terms, cookies, accessibility). */
@Entity()
export class PolicyDocument extends VendureEntity {
    constructor(input?: DeepPartial<PolicyDocument>) {
        super(input);
    }

    @Column()
    title: string;

    @Index({ unique: true })
    @Column()
    slug: string;

    @Column({ type: 'text', default: '' })
    body: string;

    @Column({ default: ContentStatus.Draft })
    status: ContentStatus;

    // --- SEO ---
    @Column({ type: 'varchar', nullable: true })
    metaTitle: string | null;

    @Column({ type: 'text', nullable: true })
    metaDescription: string | null;

    @EntityId({ nullable: true })
    ogImageAssetId: ID | null;
}
