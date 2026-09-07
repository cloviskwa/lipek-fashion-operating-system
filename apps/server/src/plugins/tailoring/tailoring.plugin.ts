import { PluginCommonModule, VendurePlugin } from '@vendure/core';

import { BookingService } from '../appointments/services/booking.service';
import { adminApiExtensions, shopApiExtensions } from './api/tailoring-api-extensions';
import { TailoringAdminResolver } from './api/tailoring-admin.resolver';
import { TailoringShopResolver } from './api/tailoring-shop.resolver';
import { tailoringPermission } from './tailoring-permissions';
import { FittingAppointment } from './entities/fitting-appointment.entity';
import { MeasurementProfile } from './entities/measurement-profile.entity';
import { ProductionTimeline } from './entities/production-timeline.entity';
import { TailoringConfiguration } from './entities/tailoring-configuration.entity';
import { TailoringJob } from './entities/tailoring-job.entity';
import { TailoringNotificationRecord } from './entities/tailoring-notification-record.entity';
import { FittingService } from './services/fitting.service';
import { MeasurementService } from './services/measurement.service';
import { TailoringService } from './services/tailoring.service';

/**
 * The tailoring module (`R-06`; SOT §10, §0C) — jobs, configurations,
 * measurements, the production timeline and fittings.
 *
 * Stage transitions run through the shared `stage-machine` engine
 * (`ADR-0014`), which owns the vocabulary, skip/backward rules,
 * per-transition permissions and the notification triggers. Fittings
 * reserve capacity through the AppointmentsPlugin's `BookingService`
 * (`R-05`), linking back via the `tailoring_job` subject pair.
 */
@VendurePlugin({
    imports: [PluginCommonModule],
    compatibility: '^3.0.0',
    dashboard: './dashboard/index.tsx',
    entities: [
        TailoringJob,
        TailoringConfiguration,
        MeasurementProfile,
        ProductionTimeline,
        FittingAppointment,
        TailoringNotificationRecord,
    ],
/**
 * FittingService shares the AppointmentsPlugin's `BookingService` class so a
 * fitting can reserve a real slot: both instances are stateless over the
 * same tables, so a private second instance is equivalent to sharing one.
 */
    providers: [TailoringService, MeasurementService, FittingService, BookingService],
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [TailoringAdminResolver],
    },
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [TailoringShopResolver],
    },
    configuration: config => {
        config.authOptions.customPermissions.push(tailoringPermission);
        return config;
    },
})
export class TailoringPlugin {}
