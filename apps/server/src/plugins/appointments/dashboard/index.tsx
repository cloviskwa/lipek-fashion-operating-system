import { defineDashboardExtension, DetailPage, ListPage } from '@vendure/dashboard';
import { AnyRoute } from '@tanstack/react-router';
import { CalendarClock } from 'lucide-react';

import * as docs from './appointments.graphql';

/**
 * Dashboard screens for the appointment domain (`R-05`, colocated per
 * `ADR-0013`): resource authoring (list + detail) and a read-only bookings
 * roster. The SOT's staff backend lists Appointments as a top-level service
 * (§21.1); the tailoring screens' "Schedule Fitting" (§22.2) will call the
 * same Admin API.
 */
export default defineDashboardExtension({
    navSections: [
        {
            id: 'lipek-appointments',
            title: 'Appointments',
            icon: CalendarClock,
            order: 270,
        },
    ],
    routes: [
        {
            path: '/appointments/resources',
            navMenuItem: {
                sectionId: 'lipek-appointments',
                id: 'appointment-resources',
                title: 'Resources',
            },
            loader: () => ({ breadcrumb: () => 'Resources' }),
            component: (route: AnyRoute) => (
                <ListPage
                    pageId="appointment-resource-list"
                    route={route}
                    title="Resources"
                    listQuery={docs.appointmentResourceListQuery as never}
                />
            ),
        },
        {
            path: '/appointments/resources/:id',
            loader: () => ({ breadcrumb: () => 'Resource' }),
            component: (route: AnyRoute) => (
                <DetailPage
                    pageId="appointment-resource-detail"
                    route={route}
                    title="Resource"
                    entityName="AppointmentResource"
                    listQuery={docs.appointmentResourceListQuery as never}
                    detailQuery={docs.appointmentResourceDetailQuery as never}
                    createMutation={docs.createAppointmentResourceMutation as never}
                    updateMutation={docs.updateAppointmentResourceMutation as never}
                />
            ),
        },
        {
            path: '/appointments/bookings',
            navMenuItem: {
                sectionId: 'lipek-appointments',
                id: 'appointment-bookings',
                title: 'Bookings',
            },
            loader: () => ({ breadcrumb: () => 'Bookings' }),
            component: (route: AnyRoute) => (
                <ListPage
                    pageId="appointment-booking-list"
                    route={route}
                    title="Bookings"
                    listQuery={docs.appointmentBookingListQuery as never}
                />
            ),
        },
    ],
});

