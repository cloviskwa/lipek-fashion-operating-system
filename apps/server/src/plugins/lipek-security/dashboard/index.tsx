import { defineDashboardExtension, ListPage } from '@vendure/dashboard';
import { AnyRoute } from '@tanstack/react-router';
import { ScrollText } from 'lucide-react';

import * as docs from './audit-log.graphql';

/**
 * Dashboard screens for the security audit trail (rebuild task `R-04`,
 * `SEC-006`). Read-only: an audit log that can be edited is not evidence, so
 * the screen exposes exactly the list the Admin API guards behind
 * `ReadAuditLog` and nothing else.
 *
 * Colocated with the plugin per `ADR-0013`; there is no separate extensions app.
 */
export default defineDashboardExtension({
    navSections: [
        {
            id: 'lipek-security',
            title: 'Security',
            icon: ScrollText,
            order: 260,
        },
    ],
    routes: [
        {
            path: '/security/audit-log',
            navMenuItem: {
                sectionId: 'lipek-security',
                id: 'audit-log',
                title: 'Audit log',
                requiresPermission: 'ReadAuditLog',
            },
            loader: () => ({ breadcrumb: () => 'Audit log' }),
            component: (route: AnyRoute) => (
                <ListPage
                    pageId="audit-log-list"
                    route={route}
                    title="Audit log"
                    listQuery={docs.auditLogListQuery as never}
                />
            ),
        },
    ],
});
