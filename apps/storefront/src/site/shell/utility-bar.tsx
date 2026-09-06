import {Suspense} from 'react';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {CurrencyPickerWrapper} from '@/site/navigation/navbar/currency-picker-wrapper';
import {LanguagePicker} from '@/site/navigation/navbar/language-picker';

/**
 * Utility bar — the thin top-level strip (design spec §8.1).
 *
 * The tagline is design-owned microcopy (SOT §5B / spec §48: the frontend
 * owns structural labels and design microcopy); the language and currency
 * pickers are live UI bound to the storefront's locale/currency state.
 * Deliberately NOT a `'use cache'` scope: the currency picker reads the
 * currency cookie (`cookies()` is illegal inside a cache scope), so this
 * composes exactly like the starter navbar did — pickers behind Suspense.
 * Collapses away on scroll via the header shell's `data-scrolled` state.
 */
export async function UtilityBar() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Shell'});

    return (
        <div className="max-h-10 overflow-hidden border-b border-border/50 transition-all duration-300 group-data-[scrolled=true]:max-h-0 group-data-[scrolled=true]:border-b-0 group-data-[scrolled=true]:opacity-0">
            <div className="container mx-auto px-4">
                <div className="flex h-9 items-center justify-between gap-4">
                    <p className="hidden text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:block">
                        {t('tagline')}
                    </p>
                    <div className="flex items-center gap-1 sm:ml-auto">
                        <Suspense>
                            <LanguagePicker />
                        </Suspense>
                        <Suspense>
                            <CurrencyPickerWrapper />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
}
