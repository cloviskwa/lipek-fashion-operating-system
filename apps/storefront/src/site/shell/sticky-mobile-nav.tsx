import {cacheLife, cacheTag} from 'next/cache';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {query} from '@/platform/vendure/api';
import {GetActiveOrderQuery} from '@/features/cart/graphql';
import {StickyNavItems} from './sticky-nav-items';

/**
 * Spec §31 — sticky mobile bottom navigation: safe-area aware, blurred
 * surface, live cart badge. Cart count comes from the same backend truth
 * the header cart uses (SOT §5A) via the identically-tagged cached query,
 * so Dashboard-driven cart changes invalidate both together.
 */
export async function StickyMobileNav() {
    'use cache: private';
    cacheLife('minutes');
    cacheTag('cart');
    cacheTag('active-order');

    const locale = await getRouteLocale();
    const [orderResult, t] = await Promise.all([
        query(GetActiveOrderQuery, undefined, {
            useAuthToken: true,
            tags: ['cart'],
        }),
        getTranslations({locale, namespace: 'Shell'}),
    ]);

    const cartItemCount = orderResult.data.activeOrder?.totalQuantity || 0;

    return (
        <nav
            aria-label={t('stickyNavLabel')}
            className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        >
            <StickyNavItems cartItemCount={cartItemCount} />
        </nav>
    );
}
