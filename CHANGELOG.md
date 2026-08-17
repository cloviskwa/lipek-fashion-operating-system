# Changelog

## Unreleased

- Rebuilt the project as a Next.js 15 App Router site (TypeScript, Tailwind CSS v4, pnpm), mirroring the
  architecture of `digital2moro-platform` (JSON content collections, typed content readers, shared
  SEO/JSON-LD helpers).
- Replaced the previous static-HTML scaffold (`src/pages`, `src/includes`, `tools/`, `config/`, static
  `public/` build output) with real routes, components and content covering all previously scaffolded
  sections: home, about, services (custom tailoring + 7 sub-categories, alterations, laundry), process,
  gallery, shop, book-fitting, testimonials, blog, FAQ, contact and legal.
- Renamed the legacy Capacitor mobile-wrapper folder from `app/` to `mobile-wrapper/` to avoid colliding
  with the Next.js App Router's `app` directory convention.
