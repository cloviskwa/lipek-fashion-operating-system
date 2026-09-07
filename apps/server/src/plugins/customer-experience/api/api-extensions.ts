import gql from 'graphql-tag';

/**
 * Shop API surface for the customer wishlist (SOT §6 / design spec §8.2,
 * §13, §36, §38). Scoped to the active customer -- there is deliberately no
 * way to address another customer's wishlist.
 */
export const shopApiExtensions = gql`
    type WishlistItem {
        id: ID!
        createdAt: DateTime!
        productVariant: ProductVariant!
    }

    extend type Query {
        """
        The signed-in customer's saved items. Empty for guests.
        """
        activeCustomerWishlist: [WishlistItem!]!
    }

    extend type Mutation {
        """
        Save a product variant to the signed-in customer's wishlist.
        Saving an already-saved variant is a no-op. Returns the full list.
        """
        addToWishlist(productVariantId: ID!): [WishlistItem!]!

        """
        Remove one of the signed-in customer's saved items. Returns the
        remaining list.
        """
        removeFromWishlist(itemId: ID!): [WishlistItem!]!
    }
`;
