# Environment Variables

**Status:** Provisional (live record — updated as each integration lands)
**Source plan:** `docs/implementation/DEPENDENCY_INSTALLATION_PLAN.md`, `docs/implementation/ADR_BACKLOG.md`

## Local toolchain (verified this Phase 0 audit, 2026-08-17)

| Tool    | Verified local version |
| ------- | ---------------------- |
| Node.js | v24.18.0               |
| pnpm    | 11.9.0                 |
| Docker  | 29.6.2                 |
| Git     | 2.55.0                 |

## Environment variable inventory

No `.env.example` exists yet — created per-app in `FOUND-016` once `apps/server`/`apps/storefront` are bootstrapped. This table is populated then, and grows with every integration (payment, email/SMS, object storage, OAuth, LLM provider).

| Variable     | Purpose | App | Required from task | Source |
| ------------ | ------- | --- | ------------------ | ------ |
| _(none yet)_ |         |     |                    |        |

Rules (binding, source of truth §0.2/§38): no secret is ever committed; every `.env*` beyond `.env.example` stays gitignored (already configured in this repo's `.gitignore`, carried over from the prior prototype); every variable added here has a documented purpose and owner task.
