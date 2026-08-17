import type { ReactNode } from 'react';

export default function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-pill bg-cream-deep px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-dark">
      {children}
    </span>
  );
}
