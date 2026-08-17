'use client';

import { useState } from 'react';
import type { FaqItem } from '@/lib/content/types';

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line rounded-lg border border-line bg-white">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-sm font-semibold text-ink">{item.question}</span>
              <span className="text-xl text-gold-dark" aria-hidden>
                {isOpen ? '−' : '+'}
              </span>
            </button>
            {isOpen ? <p className="px-6 pb-5 text-sm text-ink/70">{item.answer}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
