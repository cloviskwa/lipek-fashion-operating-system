import {graphql} from '@/platform/vendure/graphql';

/**
 * Staff-managed navigation menus (`CONTENT-005`).
 *
 * Three levels of items are requested because the design spec's mega menu
 * (§8.5) is a top-level entry → column heading → link structure. The footer
 * (§30) only uses the first level and simply ignores the rest.
 */
export const GetNavigationMenuQuery = graphql(`
    query GetNavigationMenu($identifier: String!) {
        navigationMenu(identifier: $identifier) {
            id
            identifier
            name
            items {
                id
                label
                url
                collection {
                    slug
                }
                children {
                    id
                    label
                    url
                    collection {
                        slug
                    }
                    children {
                        id
                        label
                        url
                        collection {
                            slug
                        }
                    }
                }
            }
        }
    }
`);
