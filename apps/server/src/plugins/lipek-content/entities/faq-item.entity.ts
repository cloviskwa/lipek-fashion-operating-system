import { DeepPartial } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '@vendure/core';
import { Column, Entity } from 'typeorm';

import { ContentStatus } from './content-status';

/**
 * A single question/answer pair.
 *
 * `category` is a free-form grouping key, not a relation. Values in the live
 * data: `care-faq`, `pricing-faq`, `tailoring-faq`.
 */
@Entity()
export class FaqItem extends VendureEntity {
    constructor(input?: DeepPartial<FaqItem>) {
        super(input);
    }

    @Column({ type: 'text' })
    question: string;

    @Column({ type: 'text' })
    answer: string;

    @Column({ type: 'varchar', nullable: true })
    category: string | null;

    /** Sort order within the category. */
    @Column({ default: 0 })
    position: number;

    @Column({ default: ContentStatus.Draft })
    status: ContentStatus;
}
