# ADR-0002: Email / SMS Provider

**Status:** Accepted (provisional default — must be reconfirmed before production go-live)
**Date:** 2026-08-17

## Context

Marked "UNDECIDED" in the source of truth (§0.3). Needed for transactional email (receipts, order/service updates, MFA recovery) and, separately, marketing automation (§32).

## Decision

Treat transactional and marketing as separate concerns from day one, since transactional deliverability (receipts, MFA recovery) is reliability-critical while marketing can tolerate a different provider. Default to a transactional-email specialist (e.g. Postmark or Resend) for `COM-019`/`SEC-004`, and defer the SMS/marketing provider selection until `CRM-010` (Phase 7), specifically evaluating regional SMS coverage for Cameroon/West/Central Africa before committing — do not assume a US/EU-centric provider has adequate local coverage.

## Consequences

- `COM-019` (transactional notifications) and `SEC-004` (email recovery channel) can proceed against a concrete transactional-email integration in Phase 1/4.
- SMS provider selection is explicitly deferred to Phase 7 and must include a regional-coverage check, not a default assumption.
- Reconfirm before production go-live per `MASTER_IMPLEMENTATION_PLAN.md` §14.
