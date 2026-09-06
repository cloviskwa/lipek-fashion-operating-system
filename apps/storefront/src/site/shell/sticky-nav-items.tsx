'use client';

import {Heart, Home, ShoppingBag, Store, User, type LucideIcon} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '@/platform/i18n/navigation';
import {cn} from '@/lib/utils';

type StickyNavItem = {
    href: '/' | '/search' | '/wishlist' | '/cart' | '/account';
    labelKey: 'home' | 'shop' | 'wishlist' | 'bag' | 'account';
    icon: LucideIcon;
    badge?: boolean;
};

/**
 * Spec §31's sticky mobile navigation, mapped onto the storefront's real IA:
 * "Shop" and "Search" both live at /search today (the search page IS the
 * shop-all surface), so the fifth slot is the wishlist.
 */
const ITEMS: readonly StickyNavItem[] = [
    {href: '/', labelKey: 'home', icon: Home},
    {href: '/search', labelKey: 'shop', icon: Store},
    {href: '/wishlist', labelKey: 'wishlist', icon: Heart},
    {href: '/cart', labelKey: 'bag', icon: ShoppingBag, badge: true},
    {href: '/account', labelKey: 'account', icon: User},
];

export function StickyNavItems({cartItemCount}: {cartItemCount: number}) {
    const t = useTranslations('Shell');
    const pathname = usePathname();

    return (
        <div className="grid h-16 grid-cols-5">
            {ITEMS.map(({href, labelKey, icon: Icon, badge}) => {
                const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
                return (
                    <Link
                        key={href}
                        href={href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                            'relative flex min-h-11 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                            active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <span className="relative">
                            <Icon className="size-5" aria-hidden />
                            {badge && cartItemCount > 0 && (
                                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                                    {cartItemCount}
                                </span>
                            )}
                        </span>
                        {t(labelKey)}
                    </Link>
                );
            })}
        </div>
    );
}
