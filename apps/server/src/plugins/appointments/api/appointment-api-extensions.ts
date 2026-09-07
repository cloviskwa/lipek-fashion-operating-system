import gql from 'graphql-tag';

/**
 * GraphQL extensions for the appointment domain (`R-05`).
 *
 * The Admin API is the scheduling surface (resources, slots, booking
 * lifecycle). The Shop API is the customer surface: browse available slots,
 * book, view and cancel own bookings — ownership is enforced server-side via
 * the session's customer, never by trusting a client id.
 */
const sharedExtensions = gql`
    enum AppointmentBookingStatus {
        CONFIRMED
        CANCELLED
        COMPLETED
    }

    type AppointmentResource implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        "Stable handle other plugins and the storefront address the resource by."
        code: String!
        name: String!
        "Free-form kind of resource, e.g. 'staff', 'fitting_room'."
        resourceType: String!
        description: String
        isActive: Boolean!
    }

    type AppointmentResourceList implements PaginatedList {
        items: [AppointmentResource!]!
        totalItems: Int!
    }

    type AppointmentSlot implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        startsAt: DateTime!
        endsAt: DateTime!
        isActive: Boolean!
        resourceId: ID!
    }

    type AppointmentSlotList implements PaginatedList {
        items: [AppointmentSlot!]!
        totalItems: Int!
    }

    type AppointmentBooking implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        status: AppointmentBookingStatus!
        notes: String
        cancelledAt: DateTime
        "The originally booked slot — never changes, even after reschedules."
        slotId: ID!
        "The slot currently occupied; NULL once cancelled. Unique across bookings."
        activeSlotId: ID
        resourceId: ID!
        customerId: ID
        subjectType: String
        subjectId: String
    }

    type AppointmentBookingList implements PaginatedList {
        items: [AppointmentBooking!]!
        totalItems: Int!
    }

    extend type Query {
        "Slots that are active, in the future and not occupied — the bookable list."
        availableSlots(resourceId: ID, from: DateTime, to: DateTime): AppointmentSlotList!
    }
`;

export const adminApiExtensions = gql`
    ${sharedExtensions}

    extend type Query {
        appointmentResources: AppointmentResourceList!
        appointmentResource(id: ID!): AppointmentResource
        appointmentSlots(resourceId: ID, from: DateTime, to: DateTime): AppointmentSlotList!
        appointmentBookings(statuses: [AppointmentBookingStatus!]): AppointmentBookingList!
        appointmentBooking(id: ID!): AppointmentBooking
    }

    extend type Mutation {
        createAppointmentResource(input: AppointmentResourceInput!): AppointmentResource!
        updateAppointmentResource(id: ID!, input: AppointmentResourceInput!): AppointmentResource!
        createAppointmentSlot(resourceId: ID!, startsAt: DateTime!, endsAt: DateTime!): AppointmentSlot!
        setAppointmentSlotActive(id: ID!, isActive: Boolean!): AppointmentSlot!
        "Staff-side booking for a customer, or for a service subject (e.g. a tailoring fitting)."
        createAppointmentBooking(input: CreateAppointmentBookingInput!): AppointmentBooking!
        cancelAppointmentBooking(id: ID!): AppointmentBooking!
        "Moves the booking to a new slot; the original slotId is preserved."
        rescheduleAppointmentBooking(id: ID!, newSlotId: ID!): AppointmentBooking!
        completeAppointmentBooking(id: ID!): AppointmentBooking!
    }

    input AppointmentResourceInput {
        code: String!
        name: String!
        resourceType: String!
        description: String
        isActive: Boolean
    }

    input CreateAppointmentBookingInput {
        slotId: ID!
        customerId: ID
        subjectType: String
        subjectId: String
        notes: String
    }
`;

export const shopApiExtensions = gql`
    ${sharedExtensions}

    extend type Query {
        myAppointmentBookings: AppointmentBookingList!
    }

    extend type Mutation {
        bookAppointment(slotId: ID!, notes: String): AppointmentBooking!
        "Cancels one of the session customer's own bookings."
        cancelMyAppointmentBooking(id: ID!): AppointmentBooking!
    }
`;
