 1 | # Phase 3 Storefront Experience
 2 | 
 3 | **Status:** In implementation
 4 | **Source:** `docs/implementation/MASTER_IMPLEMENTATION_PLAN.md` Phase 3
 5 | 
 6 | ## Scope Implemented
 7 | 
 8 | - Published CMS content is exposed through a public Vendure Shop API extension, never through the Admin API.
 9 | - Homepage renders backend-owned `ContentPage`/`PageSection` content with banners, services, testimonials, locations and editorial records.
10 | - Blog, generic content pages and policy documents render from published content records.
11 | - Catalog and PDP routes retain Vendure-backed collections, facets, variants, stock and related-product behavior, now with CMS/catalog SEO fields and JSON-LD.
12 | - My LIPEK account shell now includes Overview, Commerce, Services, My Style, Documents, Relationship and Account areas, all gated by active customer auth.
13 | - Storefront and Dashboard theme bridges consume the shared `@lipek/ui` theme tokens.
14 | - PWA foundation includes manifest, icons, offline shell, service worker registration and install prompt.
15 | - Customer mobile foundation records the Capacitor app id/name, PWA webDir and app-store readiness checklist.
16 | 
17 | ## Security Review
18 | 
19 | - Public content resolvers filter to `PublicationStatus.PUBLISHED`; drafts and unpublished policies/articles/pages are not exposed to the storefront.
20 | - Storefront editorial/CMS body fields are rendered as escaped text paragraphs instead of raw HTML.
21 | - Account routes redirect unauthenticated customers to sign-in and inherit noindex/nofollow metadata.
22 | - Service worker is cache-limited to shell assets and GET requests; commerce mutations are not cached.
23 | - Admin API credentials are not used by the storefront.
24 | 
25 | ## Acceptance Evidence
26 | 
27 | - `apps/storefront/tests/architecture/phase3-contracts.test.mjs` guards the Phase 3 content, account, PWA, SEO, performance/accessibility and theme contracts.
28 | - `docs/testing/performance.md` and `apps/storefront/lighthouserc.json` define the first Core Web Vitals/Lighthouse budget.
29 | - `docs/testing/accessibility.md` records the WCAG 2.2 AA baseline and manual follow-up checks.
30 | - `apps/mobile/customer/APP_STORE_READINESS.md` records the customer app pre-submission checklist and push-notification deferral.
31 | 
32 | ## Known Follow-Ups
33 | 
34 | - Run real Lighthouse and axe/Playwright audits once a stable production-like preview with seeded catalog/content exists.
35 | - Replace SVG-only manifest icons with platform-generated PNG/icon bundles before store submission if target review tooling requires PNG assets.
36 | - Replace the local Capacitor `server.url` with the production storefront origin during release packaging.