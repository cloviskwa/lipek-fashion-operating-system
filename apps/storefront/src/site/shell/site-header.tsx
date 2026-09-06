import {Suspense} from 'react';
import {HeaderScrollShell} from './header-scroll-shell';
import {UtilityBar} from './utility-bar';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {MobileNavWrapper} from '@/site/navigation/navbar/mobile-nav-wrapper';
import {NavbarCart} from '@/site/navigation/navbar/navbar-cart';
import {NavbarCollections} from '@/site/navigation/navbar/navbar-collections';
import {NavbarUser} from '@/site/navigation/navbar/navbar-user';
import {NavbarWishlist} from '@/site/navigation/navbar/navbar-wishlist';
import {ThemeSwitcher} from '@/site/navigation/navbar/theme-switcher';
import {SearchInput} from '@/site/navigation/search-input';
import {NavbarUserSkeleton} from '@/site/navigation/skeletons/navbar-user-skeleton';
import {SearchInputSkeleton} from '@/site/navigation/skeletons/search-input-skeleton';

/**
 * LIPEK custom site header (design spec §7/§8 — Phase 3 F1 structural shell).
 *
 * Composition: utility bar → main header (wordmark, mega navigation,
 * search, wishlist, account, bag). All commerce/navigation content is
 * backend-fed (SOT §5A): the mega menu renders the Dashboard-managed
 * `header` NavigationMenu, the cart badge the live active order.
 * Only the visual treatment is frontend-owned (SOT §5B).
 */
export function SiteHeader() {
    return (
        <HeaderScrollShell>
            <Suspense>
                <UtilityBar />
            </Suspense>
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between gap-4 transition-[height] duration-300 md:h-20 md:group-data-[scrolled=true]:h-16">
                    <div className="flex min-w-0 items-center gap-4 lg:gap-8">
                        <Suspense>
                            <MobileNavWrapper />
                        </Suspense>
                        <NavigationLink
                            href="/"
                            className="shrink-0 text-lg font-semibold uppercase tracking-[0.35em] md:text-xl"
                        >
                            LIPEK
                        </NavigationLink>
                        <nav className="hidden items-center xl:flex" aria-label="Primary">
                            <Suspense>
                                <NavbarCollections />
                            </Suspense>
                        </nav>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <div className="hidden lg:flex">
                            <Suspense fallback={<SearchInputSkeleton />}>
                                <SearchInput />
                            </Suspense>
                        </div>
                        <Suspense>
                            <ThemeSwitcher />
                        </Suspense>
                        <Suspense>
                            <NavbarWishlist />
                        </Suspense>
                        <Suspense>
                            <NavbarCart />
                        </Suspense>
                        <Suspense fallback={<NavbarUserSkeleton />}>
                            <NavbarUser />
                        </Suspense>
                    </div>
                </div>
            </div>
        </HeaderScrollShell>
    );
}
