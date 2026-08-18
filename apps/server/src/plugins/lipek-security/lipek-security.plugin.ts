import { PluginCommonModule, VendurePlugin } from '@vendure/core';

import { lipekCorsOptions } from './origin-allow-list';
import { rateLimitMiddleware } from './rate-limit.middleware';

/**
 * General API security baseline for the Admin and Shop GraphQL APIs:
 * origin allow-list (replacing Vendure's permissive `{ origin: true }` default)
 * and a general-purpose rate limiter.
 *
 * FOUND-019 scope only. Authentication, MFA, RBAC, and auth-endpoint-specific
 * rate limiting are original engineering work delivered in Phase 1C (`SEC-001`
 * onward) -- this plugin is deliberately minimal for now and will grow there,
 * not be replaced. Dashboard extension screens for this plugin's own future
 * MFA/audit-log work will live at `dashboard/` alongside this file per
 * `ADR-0013` once Phase 1C adds them -- none exist yet.
 */
@VendurePlugin({
    imports: [PluginCommonModule],
    configuration: config => {
        config.apiOptions.cors = lipekCorsOptions;
        config.apiOptions.middleware = [
            ...(config.apiOptions.middleware ?? []),
            { handler: rateLimitMiddleware, route: '*splat' },
        ];
        return config;
    },
})
export class LipekSecurityPlugin {}
