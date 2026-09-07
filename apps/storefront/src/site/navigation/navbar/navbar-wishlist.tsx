import {cacheLife, cacheTag} from 'next/cache';
import {WishlistIcon} from './wishlist-icon';
import {query} from '@/platform/vendure/api';
import {GetActiveCustomerWishlistQuery} from '@/features/wishlist/graphql';

/**
 * Header wishlist affordance (design spec §8.2: Search · Wishlist ·
 * Account · Bag). Renders for guests too, without a badge -- the Shop API
 * returns an empty list when nobody is signed in.
 */
export async function NavbarWishlist() {
    'use cache: private';
    cacheLife('minutes');
    cacheTag('wishlist');

    const result = await query(GetActiveCustomerWishlistQuery, undefined, {
        useAuthToken: true,
        tags: ['wishlist'],
    });

    return <WishlistIcon wishlistItemCount={result.data.activeCustomerWishlist.length} />;
}
