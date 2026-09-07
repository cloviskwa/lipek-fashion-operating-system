import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ID } from '@vendure/common/lib/shared-types';
import { Allow, Ctx, Permission, RequestContext, Transaction } from '@vendure/core';

import { WishlistItem } from '../entities/wishlist-item.entity';
import { WishlistService } from '../services/wishlist.service';

@Resolver()
export class WishlistResolver {
    constructor(private wishlistService: WishlistService) {}

    /**
     * Deliberately not gated on `Permission.Authenticated`: the header
     * renders this for every visitor, and the service returns an empty list
     * for guests.
     */
    @Query()
    async activeCustomerWishlist(@Ctx() ctx: RequestContext): Promise<WishlistItem[]> {
        return this.wishlistService.getActiveCustomerWishlist(ctx);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.Authenticated)
    async addToWishlist(
        @Ctx() ctx: RequestContext,
        @Args() args: { productVariantId: ID },
    ): Promise<WishlistItem[]> {
        return this.wishlistService.add(ctx, args.productVariantId);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.Authenticated)
    async removeFromWishlist(
        @Ctx() ctx: RequestContext,
        @Args() args: { itemId: ID },
    ): Promise<WishlistItem[]> {
        return this.wishlistService.remove(ctx, args.itemId);
    }
}
