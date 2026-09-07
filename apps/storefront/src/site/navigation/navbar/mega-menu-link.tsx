'use client';

import {Link} from '@/platform/i18n/navigation';
import {NavigationMenuLink} from '@/components/ui/navigation-menu';
import {cn} from '@/lib/utils';

/**
 * A link inside an open mega-menu panel. Styled as panel content rather than
 * as a top-level navbar trigger, which is what `NavbarLink` renders.
 */
export function MegaMenuLink({
    href,
    children,
    emphasis = false,
}: {
    href: string;
    children: React.ReactNode;
    emphasis?: boolean;
}) {
    return (
        <NavigationMenuLink
            render={
                <Link
                    href={href}
                    className={cn(
                        'block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-foreground',
                        emphasis
                            ? 'font-semibold uppercase tracking-[0.12em] text-foreground'
                            : 'text-muted-foreground',
                    )}
                >
                    {children}
                </Link>
            }
        />
    );
}
