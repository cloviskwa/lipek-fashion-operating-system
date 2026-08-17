\
# LIPEK Platform — Agent Operating Contract

This file is the standing operating contract for any coding agent (Claude Code, OpenAI Codex, or equivalent) working in this repository. It restates the operating rules from the master source of truth so they don't need to be rediscovered every session. **It does not replace the source of truth** — see Precedence below.

## Precedence

```text
1. docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md   (business intent + mandatory architecture)
2. Accepted ADRs (docs/adr/ADR-XXXX-*.md)
3. Domain/implementation documentation (docs/domains, docs/api, docs/implementation)
4. Tests and schemas
5. Current code
```

Code may never silently redefine the product. If reality requires a change to the source of truth, write an ADR, get it approved, then update the source of truth (source of truth §0.1).

**Before doing anything else in this repository, read `docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` in full**, then `docs/implementation/MASTER_IMPLEMENTATION_PLAN.md` for the current phase/task you are picking up.

## Where things are

- `docs/internal/` — the source of truth. Never move this into any `public/`-servable path of any app.
- `docs/architecture/`, `docs/domains/`, `docs/api/`, `docs/implementation/`, `docs/testing/`, `docs/operations/`, `docs/adr/` — derived/operational documentation. See `docs/implementation/DOCUMENTATION_MAP.md` for what belongs where and each document's authority level.
- `docs/implementation/MASTER_IMPLEMENTATION_PLAN.md` — the phase/task breakdown (168 tasks, IDs like `FOUND-001`, `SEC-002`, `COM-013`). Work one task at a time against its stated acceptance criteria.
- `docs/implementation/ADR_BACKLOG.md` + `docs/adr/ADR-XXXX-*.md` — open and resolved architecture decisions.
- `_reference/legacy-prototype/` — the original static-content Next.js prototype, kept for reference only during `FOUND-020` (porting reusable assets into the real `apps/storefront`). It is **not** a live application and must never be treated as one.
- `apps/mobile/customer/` — seeded from the prototype's Capacitor scaffold per `ADR-0007`. Not yet wired to a real storefront build.
- `packages/ui/src/primitives`, `packages/ui/src/tokens` — ported design-system starting points, to be expanded with dark/light token pairs (`THEME-001`).
- `packages/testing/fixtures/content` — the prototype's placeholder copy, retained as seed/fixture data only, never a production content source.

## Operating rules (source of truth §0.2)

- Read the source of truth in full before planning, scaffolding, installing dependencies, or modifying architecture.
- Do not invent missing business requirements. Do not remove requirements because they are difficult.
- Do not replace a locked technology (Vendure Core, NestJS, Vendure React Dashboard, PostgreSQL, Mastra, GraphQL Shop/Admin APIs, pnpm workspace) without an ADR.
- Verify unstable technical details against **official current documentation** before installation — package versions, API shapes, framework behavior. Do not rely on stale training data for anything version-sensitive.
- Never use the deprecated Vendure Angular Admin UI.
- Never build a duplicate generic NestJS commerce backend beside Vendure.
- Never put customer-facing business data directly in storefront/mobile source when staff should be able to edit it from the backend.
- Never perform production schema changes using `synchronize: true`; create and review migrations.
- Never put secrets, credentials, or API keys in source control.
- Never give the AI agent (Mastra service) direct unrestricted SQL/database tools.
- Implement phases sequentially with explicit acceptance criteria; run relevant tests after every phase and stop on regressions.
- Keep documentation synchronized with code.
- Keep the dependency register (`docs/implementation/dependency-register.md`, created in `FOUND-006`) current: package name, purpose, version, license, owning module, upgrade notes.
- Prefer boring, maintainable solutions for core commerce reliability; reserve experimental technology for isolated, reversible modules.

## Do-Not list (source of truth §52E)

Do not:
- hard-code catalog categories in navigation components
- hard-code product tags/filter lists
- hard-code homepage promotions that staff should edit
- bypass Vendure and write commerce tables directly
- expose Vendure Admin API credentials to the browser
- query PostgreSQL directly from the public AI agent
- use the legacy Vendure Angular Admin UI
- duplicate customer/order/payment truth across unrelated services
- create a microservice for every small feature
- add OpenSearch before the catalog/search requirements justify it (see `ADR-0004`)
- make AI write actions autonomous on day one
- use `any` as a shortcut across core domain boundaries
- install dependencies without recording why they exist
- upgrade framework majors without compatibility checks
- mark a phase complete without tests and documentation
- implement client-facing content that cannot be managed from the backend when the source of truth says it must be editable

## Additional rules from this repository's engagement

- MFA and social login (Google/Apple) are **original engineering work** — no sibling `/dev` project has a working reference implementation (`docs/implementation/SIBLING_PROJECT_SECURITY_FINDINGS.md`). Do not assume a shortcut exists; follow `ADR-0006`/`ADR-0008`.
- Mobile app strategy is hybrid per `ADR-0007`: Capacitor for the customer app, native (React Native/Expo) for the delivery/courier app, responsive Dashboard for staff/admin unless a concrete need emerges.
- Dark/light theming tokens are owned once in `packages/ui`, never redefined per app.
- AEO (answer-engine optimization) builds on top of the SEO layer once it is stable — do not build it in parallel with unstable content architecture.

## Phase discipline

Every phase must produce: **code + migrations + tests + documentation + admin coverage + security review + acceptance evidence**. A UI that merely appears to work is not a completed phase. Do not start Phase N+1 work until Phase N's Completion Gate (stated in `MASTER_IMPLEMENTATION_PLAN.md`) is satisfied.
