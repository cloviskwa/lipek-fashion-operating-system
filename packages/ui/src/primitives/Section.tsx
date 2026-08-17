import type { ReactNode } from 'react';

export default function Section({
  children,
  className = '',
  tone = 'cream',
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: 'cream' | 'white' | 'ink';
  id?: string;
}) {
  const toneClass =
    tone === 'ink'
      ? 'bg-ink text-cream'
      : tone === 'white'
        ? 'bg-white text-ink'
        : 'bg-cream text-ink';

  return (
    <section id={id} className={`py-16 md:py-24 ${toneClass} ${className}`}>
      {children}
    </section>
  );
}
