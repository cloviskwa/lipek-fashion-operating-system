/**
 * Navigation shapes and href resolution.
 *
 * Deliberately free of imports so the rule below can be unit-tested on its
 * own, without pulling in the Next.js cache or the Vendure client.
 */

/**
 * A navigation entry as rendered by the storefront. Structurally recursive:
 * the mega menu (design spec §8.5) nests entry → column → link, while the
 * footer (§30) uses only the top level.
 */
export type NavigationItem = {
    id: string;
    label: string;
    url?: string | null;
    collection?: {slug: string} | null;
    children?: readonly NavigationItem[] | null;
};

export type NavigationMenu = {
    id: string;
    identifier: string;
    name: string;
    items: readonly NavigationItem[];
};

/**
 * Resolve a menu item to an href.
 *
 * Priority matches the backend entity's documented contract: a linked
 * Collection wins over a literal `url`, so re-pointing an item at a
 * different collection in the Dashboard is enough to change where it goes.
 * Returns `null` when an item has no usable destination, which callers
 * render as "skip this item" rather than as a dead link.
 */
export function resolveNavigationItemHref(item: NavigationItem): string | null {
    if (item.collection?.slug) {
        return `/collection/${item.collection.slug}`;
    }
    return item.url?.trim() || null;
}
