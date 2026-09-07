import { DeepPartial } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '@vendure/core';
import { Column, Entity } from 'typeorm';

import { ContentStatus } from './content-status';

/**
 * A customer quote used as social proof (design spec §23).
 *
 * `rating` is nullable because a testimonial is editorial copy, not a product
 * review -- reviews are a separate `CustomerExperiencePlugin` concern.
 */
@Entity()
export class Testimonial extends VendureEntity {
    constructor(input?: DeepPartial<Testimonial>) {
        super(input);
    }

    @Column()
    authorName: string;

    @Column({ type: 'text' })
    quote: string;

    @Column({ type: 'int', nullable: true })
    rating: number | null;

    @Column({ default: ContentStatus.Draft })
    status: ContentStatus;
}
