import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/site/i18n/request.ts');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// FOUND-019: security headers ported from the pattern documented in
// docs/implementation/SIBLING_PROJECT_SECURITY_FINDINGS.md §3.2
// (digital2moro-platform's next.config.mjs). CSP starts report-only, per
// that finding's own guidance: "move to enforcing once all third-party
// origins (payment provider, OAuth, AI endpoint) are known" -- none of
// those integrations exist yet (Phase 4/1C/9 respectively).
const CSP_REPORT_ONLY = [
    "default-src 'self'",
    // Next.js's own dev/hydration runtime needs 'unsafe-inline' and
    // 'unsafe-eval' in development; production builds are stricter but
    // still need 'unsafe-inline' until a nonce-based policy is set up --
    // deferred, since this policy is report-only for now, not enforcing.
    `script-src 'self' 'unsafe-inline'${IS_PRODUCTION ? '' : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    // Matches next.config.ts's own images.remotePatterns below.
    "img-src 'self' data: https://readonlydemo.vendure.io https://demo.vendure.io http://localhost:* https://localhost:*",
    "font-src 'self' data:",
    "connect-src 'self' http://localhost:* https://localhost:*",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
].join('; ');

const nextConfig: NextConfig = {
    cacheComponents: true,
    images: {
        // This is necessary to display images from your local Vendure instance
        dangerouslyAllowLocalIP: true,
        remotePatterns: [
            {
                hostname: 'readonlydemo.vendure.io',
            },
            {
                hostname: 'demo.vendure.io'
            },
            {
                hostname: 'localhost'
            }
        ],
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {key: 'X-Content-Type-Options', value: 'nosniff'},
                    {key: 'X-Frame-Options', value: 'SAMEORIGIN'},
                    {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
                    },
                    {key: 'Content-Security-Policy-Report-Only', value: CSP_REPORT_ONLY},
                    ...(IS_PRODUCTION
                        ? [{key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload'}]
                        : []),
                ],
            },
            {
                // API routes carry no cacheable, indexable content -- never let a CDN/
                // browser cache a response meant for one request, and never let a
                // crawler index an API endpoint.
                source: '/api/:path*',
                headers: [
                    {key: 'Cache-Control', value: 'private, no-store'},
                    {key: 'X-Robots-Tag', value: 'noindex'},
                ],
            },
        ];
    },
};

export default withNextIntl(nextConfig);
