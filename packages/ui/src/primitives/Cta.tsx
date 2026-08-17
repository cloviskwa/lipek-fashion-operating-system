import Link from 'next/link';
import type { ReactNode } from 'react';

interface CtaProps {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
  className?: string;
}

const VARIANT_CLASSES: Record<NonNullable<CtaProps['variant']>, string> = {
  primary: 'bg-gold text-white hover:bg-gold-dark',
  outline: 'border border-ink text-ink hover:bg-ink hover:text-cream',
  ghost: 'text-ink underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-dark',
};

export default function Cta({ href, children, variant = 'primary', className = '' }: CtaProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-pill px-6 py-3 text-sm font-semibold tracking-wide transition-colors ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
