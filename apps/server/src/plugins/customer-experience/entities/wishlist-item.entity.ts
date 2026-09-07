import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { Customer, EntityId, ProductVariant, VendureEntity } from '@vendure/core';
import { Entity, Index, ManyToOne, Unique } from 'typeorm';

/**
 * A single saved product variant belonging to one customer.
 *
 * Stored per variant rather than per product because the design spec treats
 * the wishlist as a "save this exact thing" surface -- the product card,
 * the PDP and the cart line all offer it, and size/colour matter at each of
 * those points (spec §13, §36).
 *
 * A customer may only save a given variant once, enforced in the database
 * rather than only in the service so a double-submit cannot create duplicates.
 */
@Entity()
@Unique('UQ_wishlist_item_customer_variant', ['customerId', 'productVariantId'])
export class WishlistItem extends VendureEntity {
    constructor(input?: DeepPartial<WishlistItem>) {
        super(input);
    }

    @Index()
    @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
    customer: Customer;

    @EntityId()
    customerId: ID;

    @Index()
    @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE' })
    productVariant: ProductVariant;

    @EntityId()
    productVariantId: ID;
}
