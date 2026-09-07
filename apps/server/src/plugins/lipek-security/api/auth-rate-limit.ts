import { UserInputError } from '@vendure/core';

/**
 * Resolver-level fixed-window rate limiter for the authentication-sensitive
 * endpoints (`SEC-005`): the anonymous WebAuthn challenge/mutation surfaces
 * that accept an identifier + password. Layered *under* the general API
 * limiter (`rate-limit.middleware.ts`), with a much tighter ceiling.
 *
 * Same properties as the general limiter: generic rejection message that
 * never reveals whether the account exists, and an explicit acknowledgement
 * that an in-memory Map does not coordinate across horizontally scaled
 * instances (interim until Redis-backed hardening).
 */

interface WindowState {
    count: number;
    windowStart: number;
}

const WINDOW_MS = 60_000;
const DEFAULT_MAX_ATTEMPTS = 10;

const hits = new Map<string, WindowState>();

function maxAttempts(): number {
    const parsed = Number(process.env.LIPEK_AUTH_RATE_LIMIT_MAX);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : DEFAULT_MAX_ATTEMPTS;
}

function sweepExpired(now: number): void {
    for (const [key, state] of hits) {
        if (now - state.windowStart >= WINDOW_MS) {
            hits.delete(key);
        }
    }
}

/**
 * Count one attempt and throw a generic error when the window is exceeded.
 * `identity` is the client-controlled identifier (or an empty string for
 * identifier-less endpoints); it is combined with the request IP so that
 * rotating identifiers alone does not reset the budget.
 */
export function ensureAuthRateLimit(identity: string, clientIp: string | undefined, operation: string): void {
    const now = Date.now();
    if (hits.size > 10_000) {
        sweepExpired(now);
    }
    const key = `${operation}:${clientIp ?? 'unknown'}:${identity.trim().toLowerCase()}`;
    const state = hits.get(key);
    if (!state || now - state.windowStart >= WINDOW_MS) {
        hits.set(key, { count: 1, windowStart: now });
        return;
    }
    state.count += 1;
    if (state.count > maxAttempts()) {
        // Generic: never reveals whether the account exists.
        throw new UserInputError('Too many attempts. Please try again shortly.');
    }
}
