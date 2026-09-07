import {graphql} from '@/platform/vendure/graphql';

/**
 * The signed-in customer's saved items. Returns an empty list for guests,
 * so the header can render the wishlist affordance for every visitor
 * (design spec §8.2).
 */
export const GetActiveCustomerWishlistQuery = graphql(`
    query GetActiveCustomerWishlist {
        activeCustomerWishlist {
            id
            productVariant {
                id
                name
            }
        }
    }
`);

export const AddToWishlistMutation = graphql(`
    mutation AddToWishlist($productVariantId: ID!) {
        addToWishlist(productVariantId: $productVariantId) {
            id
        }
    }
`);

export const RemoveFromWishlistMutation = graphql(`
    mutation RemoveFromWishlist($itemId: ID!) {
        removeFromWishlist(itemId: $itemId) {
            id
        }
    }
`);
