import {cacheLife, cacheTag} from 'next/cache';
import {query} from '@/platform/vendure/api';
import {GetNavigationMenuQuery} from './graphql';
import type {NavigationMenu} from './href';

export type {NavigationItem, NavigationMenu} from './href';
export {resolveNavigationItemHref} from './href';

async function getNavigationMenu(identifier: string, locale: string): Promise<NavigationMenu | null> {
    'use cache';
    cacheLife('days');
    cacheTag(`navigation-${identifier}-${locale}`);

    const result = await query(GetNavigationMenuQuery, {identifier}, {languageCode: locale});
    return (result.data.navigationMenu as NavigationMenu | null) ?? null;
}

/**
 * The Dashboard-managed `footer` menu (design spec §30). Returns `null` when
 * staff have not created or have disabled the menu; the footer then falls
 * back to its own static legal link.
 */
export async function getFooterNavigationMenu(locale: string): Promise<NavigationMenu | null> {
    return getNavigationMenu('footer', locale);
}

/**
 * The Dashboard-managed `header` menu backing the mega navigation
 * (design spec §8.5).
 */
export async function getHeaderNavigationMenu(locale: string): Promise<NavigationMenu | null> {
    return getNavigationMenu('header', locale);
}
