'use client';

import {useMotionValueEvent, useScroll} from 'framer-motion';
import {useState, type ReactNode} from 'react';

/**
 * Sticky header shell with LIPEK's compact-on-scroll behavior
 * (design spec §8.2: "The header may become slightly more compact on
 * scroll"). Toggles `data-scrolled` once the page scrolls past a small
 * threshold; children style against it with Tailwind
 * `group-data-[scrolled=true]:` variants.
 *
 * Sticky (in-flow) rather than the starter's `fixed` header: page content
 * needs no manual top offset, and the collapse transition stays smooth.
 */
export function HeaderScrollShell({children}: {children: ReactNode}) {
    const {scrollY} = useScroll();
    const [scrolled, setScrolled] = useState(false);

    useMotionValueEvent(scrollY, 'change', (latest) => {
        setScrolled(latest > 32);
    });

    return (
        <header
            data-scrolled={scrolled}
            className="group sticky top-0 z-50 border-b border-border/60 bg-background/85 shadow-sm backdrop-blur-md"
        >
            {children}
        </header>
    );
}
