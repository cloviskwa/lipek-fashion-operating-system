import { NextFunction, Request, Response } from 'express';

/**
 * In-memory fixed-window rate limiter, applied globally to the Admin/Shop APIs.
 *
 * Ported from the pattern documented in
 * docs/implementation/SIBLING_PROJECT_SECURITY_FINDINGS.md §3.2
 * (digital2moro-platform's src/lib/security/rateLimit.ts), including its two most
 * important properties:
 *   - a generic 429 response that never reveals whether the underlying
 *     account/resource exists;
 *   - an explicit acknowledgement that an in-memory Map cannot coordinate across
 *     horizontally scaled instances -- this is a single-process, local-dev/small-
 *     deployment interim measure. Move to a Redis-backed store before Phase 11's
 *     horizontal scaling (OPS-007). Auth-endpoint-specific limits (tighter windows
 *     on login/MFA/recovery) are SEC-005 (Phase 1C), layered on top of this general
 *     limiter, not a replacement for it.
 */

interface WindowState {
    count: number;
    windowStart: number;
}

const WINDOW_MS = 60_000;
// Generous general-purpose ceiling for the whole Admin+Shop API surface (catalog
// browsing, GraphiQL exploration, etc.). SEC-005 applies a much tighter, auth-
// specific limit on top of this for login/MFA/recovery endpoints specifically.
const MAX_REQUESTS_PER_WINDOW = 300;
// Bound the map's memory footprint in a long-running process -- sweep expired
// entries opportunistically rather than never evicting anything.
const MAX_TRACKED_KEYS = 10_000;

const hits = new Map<string, WindowState>();

function keyFor(req: Request): string {
    // req.ip respects Express's trust-proxy setting (see vendure-config.ts's
    // apiOptions.trustProxy), so this stays correct behind a real reverse proxy.
    return `${req.method}:${req.path}:${req.ip}`;
}

function sweepExpired(now: number): void {
    for (const [key, state] of hits) {
        if (now - state.windowStart >= WINDOW_MS) {
            hits.delete(key);
        }
    }
}

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
    const now = Date.now();
    if (hits.size > MAX_TRACKED_KEYS) {
        sweepExpired(now);
    }

    const key = keyFor(req);
    const state = hits.get(key);

    if (!state || now - state.windowStart >= WINDOW_MS) {
        hits.set(key, { count: 1, windowStart: now });
        next();
        return;
    }

    state.count += 1;
    if (state.count > MAX_REQUESTS_PER_WINDOW) {
        res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
        return;
    }
    next();
}
