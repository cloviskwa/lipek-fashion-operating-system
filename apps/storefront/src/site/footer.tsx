import {getRouteLocale} from '@/platform/i18n/server';
import {cacheLife, cacheTag} from 'next/cache';
import {getTopCollections} from '@/features/collections/data';
import {getFooterNavigationMenu, resolveNavigationItemHref} from '@/features/navigation/data';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {getTranslations} from 'next-intl/server';
import type {ReactNode} from 'react';

const COPYRIGHT_YEAR = 2026;

async function Copyright() {
    'use cache'
    cacheLife('days');

    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Footer'});

    return (
        <div>
            &copy; {COPYRIGHT_YEAR} {t('copyright')}
        </div>
    )
}

function FooterColumn({title, children}: {title: string; children: ReactNode}) {
    return (
        <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">{title}</p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">{children}</ul>
        </div>
    );
}

/**
 * LIPEK custom footer (design spec §30 — Phase 3 F1 structural shell).
 *
 * Content ownership per SOT §5A/§5B: the SHOP column renders backend top
 * collections and the last column renders the Dashboard-managed `footer`
 * NavigationMenu; the SERVICES/MY LIPEK columns are storefront IA links
 * (frontend-owned structural labels). Social links are business data and
 * are deliberately absent until a backend settings surface exists for them.
 */
export async function Footer() {
    'use cache'
    cacheLife('days');

    const locale = await getRouteLocale();
    cacheTag(`footer-${locale}`);

    const t = await getTranslations({locale, namespace: 'Footer'});
    const [collections, footerMenu] = await Promise.all([
        getTopCollections(locale),
        getFooterNavigationMenu(locale),
    ]);

    return (
        <footer className="mt-auto border-t border-border bg-muted/30">
            <div className="container mx-auto px-4 py-14">
                <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
                    <div>
                        <NavigationLink
                            href="/"
                            className="inline-block text-xl font-semibold uppercase tracking-[0.35em] text-foreground"
                        >
                            LIPEK
                        </NavigationLink>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                            {t('description')}
                        </p>
                    </div>

                    <FooterColumn title={t('shop')}>
                        {collections.map((collection) => (
                            <li key={collection.id}>
                                <NavigationLink
                                    href={`/collection/${collection.slug}`}
                                    className="transition-colors hover:text-foreground"
                                >
                                    {collection.name}
                                </NavigationLink>
                            </li>
                        ))}
                    </FooterColumn>

                    <FooterColumn title={t('services')}>
                        <li>
                            <NavigationLink href="/tailoring" className="transition-colors hover:text-foreground">
                                {t('tailoring')}
                            </NavigationLink>
                        </li>
                        <li>
                            <NavigationLink href="/alterations" className="transition-colors hover:text-foreground">
                                {t('alterations')}
                            </NavigationLink>
                        </li>
                        <li>
                            <NavigationLink href="/laundry-dry-cleaning" className="transition-colors hover:text-foreground">
                                {t('laundry')}
                            </NavigationLink>
                        </li>
                    </FooterColumn>

                    <FooterColumn title={t('myAccount')}>
                        <li>
                            <NavigationLink href="/account/orders" className="transition-colors hover:text-foreground">
                                {t('orders')}
                            </NavigationLink>
                        </li>
                        <li>
                            <NavigationLink href="/account/profile" className="transition-colors hover:text-foreground">
                                {t('profile')}
                            </NavigationLink>
                        </li>
                        <li>
                            <NavigationLink href="/wishlist" className="transition-colors hover:text-foreground">
                                {t('wishlist')}
                            </NavigationLink>
                        </li>
                        <li>
                            <NavigationLink href="/account/addresses" className="transition-colors hover:text-foreground">
                                {t('addresses')}
                            </NavigationLink>
                        </li>
                    </FooterColumn>

                    <FooterColumn title={footerMenu?.name ?? t('legal')}>
                        {(footerMenu?.items ?? []).map((item) => {
                            const href = resolveNavigationItemHref(item);
                            if (!href) return null;
                            const isExternal = /^https?:\/\//.test(href);
                            return (
                                <li key={item.id}>
                                    {isExternal ? (
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="transition-colors hover:text-foreground"
                                        >
                                            {item.label}
                                        </a>
                                    ) : (
                                        <NavigationLink href={href} className="transition-colors hover:text-foreground">
                                            {item.label}
                                        </NavigationLink>
                                    )}
                                </li>
                            );
                        })}
                        {!footerMenu && (
                            <li>
                                <NavigationLink href="/legal" className="transition-colors hover:text-foreground">
                                    {t('legal')}
                                </NavigationLink>
                            </li>
                        )}
                    </FooterColumn>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
                    <Copyright />
                </div>
            </div>
        </footer>
    );
}
