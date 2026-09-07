import { graphql } from '@/gql';

/**
 * Typed documents for the appointments Dashboard screens (`R-05`).
 *
 * Resources get a list + detail (staff author them); bookings are read-only
 * in the Dashboard for now — the lifecycle mutations exist on the Admin API
 * and richer booking management is Dashboard follow-up work.
 */

export const appointmentResourceListQuery = graphql(`
    query AppointmentResourceList($options: AppointmentResourceListOptions) {
        appointmentResources(options: $options) {
            items {
                id
                createdAt
                updatedAt
                code
                name
                resourceType
                isActive
            }
            totalItems
        }
    }
`);

export const appointmentResourceDetailQuery = graphql(`
    query AppointmentResourceDetail($id: ID!) {
        appointmentResource(id: $id) {
            id
            code
            name
            resourceType
            description
            isActive
        }
    }
`);

export const createAppointmentResourceMutation = graphql(`
    mutation CreateAppointmentResource($input: AppointmentResourceInput!) {
        createAppointmentResource(input: $input) {
            id
        }
    }
`);

export const updateAppointmentResourceMutation = graphql(`
    mutation UpdateAppointmentResource($id: ID!, $input: AppointmentResourceInput!) {
        updateAppointmentResource(id: $id, input: $input) {
            id
        }
    }
`);

export const appointmentBookingListQuery = graphql(`
    query AppointmentBookingList($options: AppointmentBookingListOptions) {
        appointmentBookings(options: $options) {
            items {
                id
                createdAt
                status
                slotId
                activeSlotId
                resourceId
                customerId
                subjectType
                subjectId
                notes
                cancelledAt
            }
            totalItems
        }
    }
`);
