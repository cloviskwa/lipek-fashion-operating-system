import {NextResponse} from 'next/server';

// A plain liveness check: is the Next.js server process up and responding.
// Deliberately does not attempt a live round-trip to the Vendure Shop API --
// coupling storefront liveness to backend reachability turns a transient
// backend blip into a storefront outage, which is the wrong failure mode
// for a customer-facing edge process. Backend connectivity is apps/server's
// own /health concern (see docs/implementation/deployment-topology.md);
// infra-level checks (Docker/host healthcheck, load balancer) are what
// should compose the two rather than one process reaching into the other.
export function GET() {
    return NextResponse.json(
        {status: 'ok', service: 'storefront', timestamp: new Date().toISOString()},
        {headers: {'Cache-Control': 'no-store'}}
    );
}
