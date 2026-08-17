# ADR-0003: S3-Compatible Object Storage Provider

**Status:** Accepted (provisional default — must be reconfirmed before production go-live)
**Date:** 2026-08-17

## Context

Marked "PLANNED — provider selected during infrastructure ADR" (source of truth §0.3). Local development is unblocked regardless via Vendure's `AssetServerPlugin` (`FOUND-021`).

## Decision

Default to a low/no-egress-fee provider (Cloudflare R2 or Backblaze B2) for production object storage, given the storefront serves image-heavy catalog/gallery content to a global audience. MinIO remains the local-dev emulator regardless of the final production choice. Final selection is confirmed alongside `ADR-0009` (hosting) for network-locality reasons — an object store far from the compute region adds latency.

## Consequences

- `FOUND-021` (local asset pipeline) proceeds immediately using `AssetServerPlugin` + MinIO emulation.
- `OPS-008` (production cutover) is gated on this ADR's final confirmation, tied to the hosting decision.
