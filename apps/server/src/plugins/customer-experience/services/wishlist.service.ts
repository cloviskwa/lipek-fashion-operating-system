import { Injectable } from '@nestjs/common';
import { ID } from '@vendure/common/lib/shared-types';
import {
    CustomerService,
    EntityNotFoundError,
    ForbiddenError,
    ProductVariantService,
    RequestContext,
    TransactionalConnection,
} from '@vendure/core';

import { WishlistItem } from '../entities/wishlist-item.entity';

/**
 * Wishlist read/write operations for the *active* customer only.
 *
 * Every method resolves the customer from the RequestContext rather than
 * accepting a customer id from the caller, so one signed-in customer can
 * never read or mutate another's wishlist.
 */
@Injectable()
export class WishlistService {
    constructor(
        private connection: TransactionalConnection,
        private customerService: CustomerService,
        private productVariantService: ProductVariantService,
    ) {}

    /**
     * The signed-in customer's saved items, newest first.
     *
     * Returns an empty list for guests instead of throwing: the header's
     * wishlist icon renders for everyone, and a logged-out visitor simply
     * has nothing saved yet.
     */
    async getActiveCustomerWishlist(ctx: RequestContext): Promise<WishlistItem[]> {
        const customerId = await this.getActiveCustomerId(ctx);
        if (customerId == null) {
            return [];
        }
        return this.connection.getRepository(ctx, WishlistItem).find({
            where: { customerId },
            relations: { productVariant: true },
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Save a variant. Idempotent -- saving an already-saved variant is a
     * no-op rather than an error, since the UI toggles optimistically.
     */
    async add(ctx: RequestContext, productVariantId: ID): Promise<WishlistItem[]> {
        const customerId = await this.requireActiveCustomerId(ctx);

        const variant = await this.productVariantService.findOne(ctx, productVariantId);
        if (!variant) {
            throw new EntityNotFoundError('ProductVariant', productVariantId);
        }

        const repository = this.connection.getRepository(ctx, WishlistItem);
        const existing = await repository.findOne({ where: { customerId, productVariantId } });
        if (!existing) {
            await repository.save(new WishlistItem({ customerId, productVariantId }));
        }

        return this.getActiveCustomerWishlist(ctx);
    }

    /**
     * Remove one of the active customer's own saved items. Deleting by
     * (id, customerId) means a guessed id belonging to someone else matches
     * nothing rather than deleting their row.
     */
    async remove(ctx: RequestContext, itemId: ID): Promise<WishlistItem[]> {
        const customerId = await this.requireActiveCustomerId(ctx);
        const repository = this.connection.getRepository(ctx, WishlistItem);

        const item = await repository.findOne({ where: { id: itemId, customerId } });
        if (!item) {
            throw new EntityNotFoundError('WishlistItem', itemId);
        }
        await repository.remove(item);

        return this.getActiveCustomerWishlist(ctx);
    }

    private async getActiveCustomerId(ctx: RequestContext): Promise<ID | undefined> {
        if (!ctx.activeUserId) {
            return undefined;
        }
        const customer = await this.customerService.findOneByUserId(ctx, ctx.activeUserId);
        return customer?.id;
    }

    private async requireActiveCustomerId(ctx: RequestContext): Promise<ID> {
        const customerId = await this.getActiveCustomerId(ctx);
        if (customerId == null) {
            throw new ForbiddenError();
        }
        return customerId;
    }
}
