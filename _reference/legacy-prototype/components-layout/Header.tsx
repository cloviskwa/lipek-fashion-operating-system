'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { CONTACT, NAV_LINKS, SITE_NAME } from '@/lib/config/site';
import Container from '@/components/ui/primitives/Container';
import Cta from '@/components/ui/primitives/Cta';

export default function Header() {
  const pathname = usePathname() ?? '/';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/95 backdrop-blur">
      <Container className="flex items-center justify-between py-4">
        <Link href="/" className="font-heading text-2xl font-semibold text-ink">
          {SITE_NAME}
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <div key={link.href} className="group relative">
                <Link
                  href={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors hover:text-gold-dark ${
                    isActive ? 'text-gold-dark' : 'text-ink'
                  }`}
                >
                  {link.label}
                </Link>
                {link.children ? (
                  <div className="invisible absolute left-0 top-full z-10 mt-2 w-56 rounded-md border border-line bg-white p-2 opacity-0 shadow-card transition-all group-hover:visible group-hover:opacity-100">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-sm px-3 py-2 text-sm text-ink hover:bg-cream-deep"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Cta href="/book-fitting" variant="primary">
            Book a Fitting
          </Cta>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="flex flex-col gap-1.5 lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className="block h-0.5 w-6 bg-ink" />
          <span className="block h-0.5 w-6 bg-ink" />
          <span className="block h-0.5 w-6 bg-ink" />
        </button>
      </Container>

      {isMenuOpen ? (
        <div className="border-t border-line bg-cream lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.flatMap((link) => [link, ...(link.children ?? [])]).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-sm px-2 py-2 text-sm font-medium text-ink hover:bg-cream-deep"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={CONTACT.phoneHref}
              className="mt-2 rounded-pill bg-gold px-4 py-2 text-center text-sm font-semibold text-white"
            >
              Call {CONTACT.phone}
            </a>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
