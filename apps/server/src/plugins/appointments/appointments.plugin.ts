import { PluginCommonModule, VendurePlugin } from '@vendure/core';

import { AppointmentAdminResolver } from './api/appointment-admin.resolver';
import { adminApiExtensions, shopApiExtensions } from './api/appointment-api-extensions';
import { AppointmentShopResolver } from './api/appointment-shop.resolver';
import { appointmentPermission } from './appointment-permissions';
import { AppointmentBooking } from './entities/appointment-booking.entity';
import { AppointmentResource } from './entities/appointment-resource.entity';
import { AppointmentSlot } from './entities/appointment-slot.entity';
import { AppointmentService } from './services/appointment.service';
import { BookingService } from './services/booking.service';

/**
 * Appointment resources, slots and bookings (`R-05`; SOT §0C).
 *
 * The domain primitive every service plugin schedules against: tailoring
 * fittings (SOT §10.2) and CRM consultations (§20.2) book through
 * `createAppointmentBooking` with a polymorphic
 * `subjectType`/`subjectId` pair, while customers book themselves through
 * the Shop API ("Book Measurement Appointment", §9).
 *
 * Slots are exclusive — the surviving schema's UNIQUE index on
 * `AppointmentBooking.activeSlotId` is the double-booking guard, with
 * `slotId` preserving the originally booked slot across reschedules.
 */
@VendurePlugin({
    imports: [PluginCommonModule],
    compatibility: '^3.0.0',
    dashboard: './dashboard/index.tsx',
    entities: [AppointmentResource, AppointmentSlot, AppointmentBooking],
    providers: [AppointmentService, BookingService],
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [AppointmentAdminResolver],
    },
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [AppointmentShopResolver],
    },
    configuration: config => {
        config.authOptions.customPermissions.push(appointmentPermission);
        return config;
    },
})
export class AppointmentsPlugin {}
