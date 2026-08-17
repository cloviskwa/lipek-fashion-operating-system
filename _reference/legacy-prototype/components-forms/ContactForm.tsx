'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export default function ContactForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();

    if (!name || !email || !message) {
      setError('Please fill in your name, email and message.');
      return;
    }

    setIsSubmitting(true);
    router.push('/contact/thank-you');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-line bg-white p-6 md:p-8">
      {error ? (
        <p className="rounded-md bg-clay/10 px-4 py-3 text-sm text-clay" role="alert">
          {error}
        </p>
      ) : null}

      <div>
        <label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-wide text-ink/70">
          Full Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          className="mt-2 w-full rounded-md border border-line px-4 py-3 text-sm focus:border-gold focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="text-xs font-semibold uppercase tracking-wide text-ink/70">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          className="mt-2 w-full rounded-md border border-line px-4 py-3 text-sm focus:border-gold focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="text-xs font-semibold uppercase tracking-wide text-ink/70">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          className="mt-2 w-full rounded-md border border-line px-4 py-3 text-sm focus:border-gold focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-pill bg-gold px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gold-dark disabled:opacity-60"
      >
        {isSubmitting ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
