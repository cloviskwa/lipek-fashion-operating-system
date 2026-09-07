import { PluginCommonModule, VendurePlugin } from '@vendure/core';

import { shopApiExtensions } from './api/api-extensions';
import { WishlistResolver } from './api/wishlist.resolver';
import { WishlistItem } from './entities/wishlist-item.entity';
import { WishlistService } from './services/wishlist.service';

/**
 * Customer experience extensions (SOT §0B.3 `CustomerExperiencePlugin`).
 *
 * Scope today is the wishlist. Reviews and saved looks are named in the SOT
 * for this same plugin and belong here when they are built -- not in a new
 * plugin each.
 */
@VendurePlugin({
    imports: [PluginCommonModule],
    compatibility: '^3.0.0',
    entities: [WishlistItem],
    providers: [WishlistService],
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [WishlistResolver],
    },
})
export class CustomerExperiencePlugin {}
