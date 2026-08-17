import type { ReactNode } from 'react';

export default function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-line bg-white p-6 shadow-card transition-transform hover:-translate-y-1 ${className}`}
    >
      {children}
    </div>
  );
}
