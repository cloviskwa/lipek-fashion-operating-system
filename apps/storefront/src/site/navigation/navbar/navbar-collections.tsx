import {getRouteLocale} from '@/platform/i18n/server';
import {cacheLife, cacheTag} from 'next/cache';
import {getTopCollections} from '@/features/collections/data';
import {
    getHeaderNavigationMenu,
    resolveNavigationItemHref,
    type NavigationItem,
} from '@/features/navigation/data';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {MegaMenuLink} from '@/site/navigation/navbar/mega-menu-link';
import {NavbarLink} from '@/site/navigation/navbar/navbar-link';
import {getTranslations} from 'next-intl/server';

/**
 * Primary navigation (design spec §8.5 mega navigation).
 *
 * Renders the Dashboard-managed `header` NavigationMenu: top-level entries
 * with children open a panel listing those children, entries without
 * children render as plain links. Adding or re-ordering a category is a
 * Dashboard edit, never a deploy -- the Do-Not-list rule against
 * hard-coding catalog categories in navigation components.
 *
 * If staff have not yet created a `header` menu, this falls back to the
 * backend's own top-level collections so the header is never empty.
 */
export async function NavbarCollections() {
    'use cache';
    cacheLife('days');

    const locale = await getRouteLocale();
    cacheTag(`navbar-collections-${locale}`);
    cacheTag(`navigation-header-${locale}`);

    const menu = await getHeaderNavigationMenu(locale);

    if (!menu || menu.items.length === 0) {
        const collections = await getTopCollections(locale);
        return (
            <NavigationMenu>
                <NavigationMenuList>
                    {collections.map((collection) => (
                        <NavigationMenuItem key={collection.slug}>
                            <NavbarLink href={`/collection/${collection.slug}`}>
                                {collection.name}
                            </NavbarLink>
                        </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
            </NavigationMenu>
        );
    }

    const t = await getTranslations({locale, namespace: 'Navigation'});

    return (
        <NavigationMenu>
            <NavigationMenuList>
                {menu.items.map((item) => (
                    <NavigationMenuItem key={item.id}>
                        <TopLevelEntry item={item} shopAllLabel={t('shopAll')} />
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
}

function TopLevelEntry({item, shopAllLabel}: {item: NavigationItem; shopAllLabel: string}) {
    const href = resolveNavigationItemHref(item);
    const children = (item.children ?? []).filter((child) => resolveNavigationItemHref(child));

    if (children.length === 0) {
        // Nothing to open: render a plain link, or nothing at all if staff
        // left the entry without a destination.
        return href ? <NavbarLink href={href}>{item.label}</NavbarLink> : null;
    }

    return (
        <>
            <NavigationMenuTrigger className="bg-transparent">{item.label}</NavigationMenuTrigger>
            <NavigationMenuContent>
                <div className="w-[min(90vw,32rem)] p-2">
                    {href && (
                        <div className="mb-1 border-b border-border pb-1">
                            <MegaMenuLink href={href} emphasis>
                                {shopAllLabel} {item.label}
                            </MegaMenuLink>
                        </div>
                    )}
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        {children.map((child) => {
                            const childHref = resolveNavigationItemHref(child)!;
                            return (
                                <li key={child.id}>
                                    <MegaMenuLink href={childHref}>{child.label}</MegaMenuLink>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </NavigationMenuContent>
        </>
    );
}
