import { defineDashboardExtension, ListPage } from '@vendure/dashboard';
import { AnyRoute } from '@tanstack/react-router';
import { Scissors } from 'lucide-react';

import * as docs from './tailoring.graphql';

/**
 * Dashboard screens for the tailoring module (`R-06`, colocated per
 * `ADR-0013`): the job roster with production stage, and the fittings
 * calendar. Stage transitions and detail authoring call the Admin API
 * directly from the job detail screen (follow-up polish adds custom
 * transition buttons).
 */
export default defineDashboardExtension({
    navSections: [
        {
            id: 'lipek-tailoring',
            title: 'Tailoring',
            icon: Scissors,
            order: 240,
        },
    ],
    routes: [
        {
            path: '/tailoring/jobs',
            navMenuItem: {
                sectionId: 'lipek-tailoring',
                id: 'tailoring-jobs',
                title: 'Jobs',
            },
            loader: () => ({ breadcrumb: () => 'Jobs' }),
            component: (route: AnyRoute) => (
                <ListPage
                    pageId="tailoring-job-list"
                    route={route}
                    title="Tailoring jobs"
                    listQuery={docs.tailoringJobListQuery as never}
                />
            ),
        },
        {
            path: '/tailoring/fittings',
            navMenuItem: {
                sectionId: 'lipek-tailoring',
                id: 'tailoring-fittings',
                title: 'Fittings',
            },
            loader: () => ({ breadcrumb: () => 'Fittings' }),
            component: (route: AnyRoute) => (
                <ListPage
                    pageId="tailoring-fitting-list"
                    route={route}
                    title="Fittings"
                    listQuery={docs.fittingListQuery as never}
                />
            ),
        },
    ],
});
