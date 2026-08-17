# Documentation Map

**Status:** Authoritative
**Purpose:** Define every document required to build and operate LIPEK, its relationship to the master source of truth, and its authority level, so documentation never duplicates the SOT and never drifts silently from it.

## 1. Authority Levels

| Level | Meaning |
|---|---|
| **Authoritative** | This document itself is the decision record for its topic once approved (e.g. an accepted ADR, this map, the architecture assessments). Changes here are decisions, not summaries. |
| **Derived** | Restates/operationalizes the SOT or an authoritative doc for a specific audience (e.g. a domain playbook derived from SOT §10–§13). Must never contradict its source; if it needs to, the source changes first via ADR. |
| **Provisional** | Best-current-understanding, expected to change as implementation proceeds (e.g. dependency register before versions are locked, environment-variable inventory before all integrations are chosen). |
| **Operational** | Living runbooks/logs that describe how the system is actually run day to day (deployment steps, incident response, monitoring). Updated continuously, not milestone-gated. |

Every document created under `docs/` must declare its level in a front-matter-style line under its title, matching the pattern used in this repository's architecture/implementation docs already created.

## 2. Precedence (restates SOT §0.1 for documentation authors)

```text
1. LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md   (business intent + mandatory architecture)
2. Accepted ADRs (docs/adr/ADR-XXXX-*.md)
3. Domain/implementation documentation (docs/domains, docs/api, docs/implementation)
4. Tests and schemas
5. Current code
```

Documentation must never redefine the product; if reality requires a change to the SOT, write an ADR, get it approved, then update the SOT (per SOT §0.1).

## 3. Document Inventory

### `docs/architecture/`

| Document | Level | Status | Relationship to SOT |
|---|---|---|---|
| `CURRENT_REPOSITORY_ASSESSMENT.md` | Authoritative | **Created** | Independent audit; feeds Gap Analysis |
| `GAP_ANALYSIS.md` | Authoritative | **Created** | Compares current state against SOT requirements item by item |
| `TARGET_REPOSITORY_STRUCTURE.md` | Derived | **Created** | Operationalizes SOT §0A for this specific repository, extended with mobile/theming/AEO placement |
| `system-overview.md` | Derived | Pending (`FOUND-005`) | Restates SOT §2 High-Level Architecture with current concrete service names/ports once bootstrapped |
| `deployment-topology.md` | Derived | Pending (`FOUND-018`) | Operationalizes SOT §52A once ADR-0009 (hosting) resolves |
| `domain-boundaries.md` | Derived | Pending (`FOUND-005`) | Restates SOT §0C plugin/domain table with actual entity/API ownership as built |
| `data-model.md` | Derived | Pending (`COM-002`, grows every phase) | Entity-relationship documentation per domain, updated as migrations land |
| `event-model.md` | Derived | Pending (`FOUND-022`) | Canonical event catalog, expands from SOT §40's example list to the full implemented set |
| `admin-content-architecture.md` | Derived | Pending (`CONTENT-001`) | Operationalizes SOT §0B/§20A |
| `storefront-architecture.md` | Derived | Pending (`FOUND-005`) | Operationalizes SOT §3.1/§6A |
| `ai-architecture.md` | Derived | Pending (`AI-001`) | Operationalizes SOT §23A/§31 |
| `search-architecture.md` | Derived | Pending (`SEARCH-001`) | Operationalizes SOT §3.4/§16A |
| `security-architecture.md` | Derived | Pending (`SEC-001`) | Operationalizes SOT §38/§52C **plus** this engagement's MFA/social-login/hardening requirements; consumes `ADR_BACKLOG.md` ADR-0006/0008 and `SIBLING_PROJECT_SECURITY_FINDINGS.md` |
| `integration-map.md` | Derived | Pending (`FOUND-023`) | Catalogs every external integration (payment, email/SMS, object storage, OAuth providers, AI model provider) with owner plugin |

### `docs/domains/`

| Document | Level | Status | Relationship to SOT |
|---|---|---|---|
| `commerce.md` | Derived | Pending (`COM-001`) | SOT §4–§9, §16A |
| `catalog-taxonomy.md` | Derived | Pending (`COM-003`) | SOT §5 (Men/Women/Children category trees), §0B.2 (Vendure catalog mapping) |
| `tailoring.md` | Derived | Pending (`TAILOR-001`) | SOT §9A, §10–§11 |
| `alterations.md` | Derived | Pending (`ALTER-001`) | SOT §12 |
| `laundry.md` | Derived | Pending (`LAUNDRY-001`) | SOT §13 |
| `crm.md` | Derived | Pending (`CRM-001`) | SOT §19A–§20 |
| `loyalty.md` | Derived | Pending (`CRM-008`) | SOT §19 |
| `documents.md` | Derived | Pending (`COM-020`) | SOT §14A–§15 |
| `content-management.md` | Derived | Pending (`CONTENT-001`) | SOT §0B.3 |

### `docs/api/`

| Document | Level | Status | Relationship to SOT |
|---|---|---|---|
| `storefront-graphql.md` | Derived | Pending (`FOUND-007`, grows every phase) | Shop API surface consumed by `apps/storefront`/`apps/mobile/customer` |
| `admin-api-extensions.md` | Derived | Pending (`FOUND-007`, grows every phase) | Admin API extensions added by each LIPEK plugin |
| `ai-tools.md` | Derived | Pending (`AI-003`) | SOT §24.2 tool catalog, expanded with actual authorization rules per SOT §23A.3 |
| `integration-contracts.md` | Derived | Pending (`FOUND-023`) | Webhook/payload contracts for payment, email/SMS, OAuth |

### `docs/implementation/`

| Document | Level | Status | Relationship to SOT |
|---|---|---|---|
| `MASTER_IMPLEMENTATION_PLAN.md` | Authoritative | **Created** | This engagement's primary deliverable; translates SOT §48A/§49 into phases/tasks |
| `DEPENDENCY_INSTALLATION_PLAN.md` | Provisional | **Created** | Pre-installation map; becomes `dependency-register.md` once packages are actually added |
| `ADR_BACKLOG.md` | Authoritative | **Created** | Tracks open decisions; individual ADRs promoted to `docs/adr/ADR-XXXX-*.md` when resolved |
| `SIBLING_PROJECT_SECURITY_FINDINGS.md` | Operational (research record) | **Created** | Input to ADR-0006/ADR-0008, not itself a design doc |
| `DOCUMENTATION_MAP.md` | Authoritative | **Created** | This document |
| `dependency-register.md` | Provisional | Pending (`FOUND-006`) | Live record of every installed package, per SOT §0.2 |
| `environment-variables.md` | Provisional | Pending (`FOUND-006`) | Every env var, its purpose, which ADR/integration it depends on |
| `local-development.md` | Operational | Pending (`FOUND-020`) | One-command local startup guide (Phase 1 acceptance criterion) |
| `migrations.md` | Operational | Pending (`FOUND-017`) | Migration policy and how-to (SOT §52B: no `synchronize: true` in production) |
| `feature-flags.md` | Derived | Pending (`OPS-013`) | Operationalizes SOT §46 |

### `docs/testing/`

| Document | Level | Status | Relationship to SOT |
|---|---|---|---|
| `strategy.md` | Derived | Pending (`FOUND-009`) | Operationalizes SOT §0F.4/§43 |
| `test-matrix.md` | Derived | Pending (`FOUND-009`, grows every phase) | Maps each phase's acceptance criteria to concrete automated tests |
| `performance.md` | Derived | Pending (`FOUND-009`) | Core Web Vitals/load-test budgets, SOT §41/§51 |
| `accessibility.md` | Derived | Pending (`FOUND-009`) | WCAG 2.2 AA target, SOT §37 |
| `ai-evals.md` | Derived | Pending (`AI-010`) | SOT §23A.4 quality gates |

### `docs/operations/`

| Document | Level | Status | Relationship to SOT |
|---|---|---|---|
| `deployment.md` | Operational | Pending (`OPS-014`) | SOT §44 pipeline, concrete once ADR-0009 lands |
| `monitoring.md` | Operational | Pending (`OPS-011`) | SOT §42 |
| `incident-response.md` | Operational | Pending (`OPS-015`) | New — not explicit in SOT but implied by §45 disaster-recovery posture |
| `backup-recovery.md` | Operational | Pending (`OPS-016`) | SOT §45 |
| `runbook.md` | Operational | Pending (`OPS-014`), grows continuously | General day-2 operations |

### `docs/adr/`

| Document | Level | Status |
|---|---|---|
| `ADR-0001-*.md` … `ADR-0011-*.md` | Authoritative once accepted | Pending — created individually as each backlog item in `ADR_BACKLOG.md` is decided |

### Repository root

| Document | Level | Status | Relationship to SOT |
|---|---|---|---|
| `README.md` | Derived | Pending rewrite (`FOUND-004`) | Currently `Readme.md` describes the old static prototype only |
| `AGENTS.md` | Authoritative (operating contract) | Pending (`FOUND-003`) | Restates SOT §0.2 operating rules + §52E "Do Not" list for any coding agent entering the repo, without needing to re-read the full SOT every session (SOT itself remains precedence authority) |
| `CLAUDE.md` | Authoritative (operating contract) | Pending (`FOUND-003`) | Same content as `AGENTS.md`, Claude-Code-specific entry point |

## 4. Avoiding Duplication

- Domain docs (`docs/domains/*`) describe *what the domain does and why*; API docs (`docs/api/*`) describe *the contract*; neither restates the other's content, they cross-link.
- `MASTER_IMPLEMENTATION_PLAN.md` owns task sequencing and acceptance criteria; domain docs do not repeat task IDs, they link to them.
- `ADR_BACKLOG.md` owns *open* decisions; `docs/adr/ADR-XXXX-*.md` owns *closed* decisions. A decision exists in exactly one of the two at any time.
- The SOT itself is never copied into any derived document — derived docs cite section numbers (as this map and the architecture docs already do) rather than reproducing SOT text.
