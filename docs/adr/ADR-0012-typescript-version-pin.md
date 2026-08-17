# ADR-0012: TypeScript Version Pin for Phase 1

**Status:** Accepted
**Date:** 2026-08-17

## Context

During the pre-Phase-1 architecture normalization pass, reverifying package versions against the npm registry (not assumed from Phase 0 memory, per `AGENTS.md`'s "verify unstable technical details" rule) found that the `typescript` package's `latest` dist-tag is now **7.0.2** — TypeScript 7, a from-scratch native (Go) compiler that reached general availability on 2026-07-08, roughly six weeks before this pass.

TypeScript 7.0 is not a routine minor bump:
- It ships with **no stable programmatic compiler API** — Microsoft has stated that lands in 7.1, "several months away."
- `typescript-eslint` filed and closed a TypeScript-7-support request as **"not planned"** on GA day, specifically because of the missing API.
- Tooling built on the old `ts.*` API surface (e.g. `ts-morph`) is reported completely broken against the native compiler.
- The only documented interim workaround — running 7.0 for `tsc` while pinning a separate TypeScript 6.0 compatibility package just for ESLint — is not something Phase 1's CI baseline (`FOUND-023`) should be built on.

Source of truth §0.4/§0.2 requires re-verifying versions against current documentation before installation and explicitly warns against blindly pinning versions from planning documents months later. This ADR is that verification landing on a *deliberate non-default* choice, not an oversight.

## Decision

Pin TypeScript to the **latest 5.9.x line** across the monorepo (`packages/config`'s shared TS config, and every app's `devDependencies`) for all of Phase 1. Do not run `pnpm add -D typescript@latest` anywhere in this repository until this ADR is revisited. The root `package.json`'s existing `"typescript": "^5.9.3"` pin is already safe (a caret range does not cross a major version boundary into 7.x) and requires no change.

Revisit this ADR once **all** of the following are true: `typescript-eslint` ships confirmed TypeScript 7.1+ support, Next.js's and NestJS/Vendure's own toolchains confirm compatibility, and GraphQL codegen tooling (needed for `packages/graphql`) is verified compatible. Until then, TypeScript 7 adoption is explicitly out of scope, not merely deferred by inertia.

## Consequences

- `FOUND-015` (workspace/toolchain normalization) and `FOUND-023` (CI baseline) proceed against TypeScript 5.9.x without ambiguity.
- `docs/implementation/dependency-register.md` records this pin and the reasoning so a future session doesn't "helpfully" upgrade to `latest`.
- A stale/out-of-date read of this ADR is itself a risk — if significant time has passed since 2026-08-17, re-run the same registry/ecosystem check before trusting this conclusion, per this ADR's own reasoning.
