import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, ID, RequestContext, UserInputError } from '@vendure/core';

import { isBookingStatus, BOOKING_STATUSES } from '../common/booking-rules';
import { AppointmentBooking } from '../entities/appointment-booking.entity';
import { AppointmentResource } from '../entities/appointment-resource.entity';
import { AppointmentSlot } from '../entities/appointment-slot.entity';
import { appointmentPermission } from '../appointment-permissions';
import { AppointmentService } from '../services/appointment.service';
import { BookingService } from '../services/booking.service';

function parseStatuses(statuses?: string[] | null) {
    if (!statuses?.length) {
        return undefined;
    }
    return statuses.map(status => {
        if (!isBookingStatus(status)) {
            throw new UserInputError(`Unknown booking status "${status}". Valid: ${BOOKING_STATUSES.join(', ')}.`);
        }
        return status;
    });
}

/**
 * Admin scheduling surface (`R-05`): resources, slots and the booking
 * lifecycle, guarded by the `Appointment` CRUD permission. The tailoring
 * plugin's fittings book through `createAppointmentBooking` with a
 * `subjectType`/`subjectId` pair (SOT §10.2 "Schedule Fitting").
 */
@Resolver()
export class AppointmentAdminResolver {
    constructor(
        private appointmentService: AppointmentService,
        private bookingService: BookingService,
    ) {}

    @Query()
    @Allow(appointmentPermission.Read)
    appointmentResources(
        @Ctx() ctx: RequestContext,
        @Args() args: { options?: any },
    ): Promise<any> {
        return this.appointmentService.resources(ctx, args.options);
    }

    @Query()
    @Allow(appointmentPermission.Read)
    async appointmentResource(@Ctx() ctx: RequestContext, @Args('id') id: ID) {
        const resource = await this.appointmentService.resource(ctx, id);
        if (!resource) {
            throw new UserInputError('Unknown resource.');
        }
        return resource;
    }

    @Query()
    @Allow(appointmentPermission.Read)
    appointmentSlots(
        @Ctx() ctx: RequestContext,
        @Args() args: {
            options?: any;
            resourceId?: ID | null;
            from?: Date | null;
            to?: Date | null;
        },
    ): Promise<any> {
        return this.appointmentService.slots(
            ctx,
            {
                resourceId: args.resourceId ?? undefined,
                from: args.from ?? undefined,
                to: args.to ?? undefined,
            },
            args.options,
        );
    }

    @Query()
    @Allow(appointmentPermission.Read)
    appointmentBookings(
        @Ctx() ctx: RequestContext,
        @Args() args: { options?: any; statuses?: string[] | null },
    ): Promise<any> {
        return this.bookingService.bookings(ctx, args.options, { statuses: parseStatuses(args.statuses) });
    }

    @Query()
    @Allow(appointmentPermission.Read)
    async appointmentBooking(@Ctx() ctx: RequestContext, @Args('id') id: ID) {
        const booking = await this.bookingService.booking(ctx, id);
        if (!booking) {
            throw new UserInputError('Unknown booking.');
        }
        return booking;
    }

    @Mutation()
    @Allow(appointmentPermission.Create)
    createAppointmentResource(
        @Ctx() ctx: RequestContext,
        @Args('input') input: { code: string; name: string; resourceType: string; description?: string | null },
    ): Promise<AppointmentResource> {
        return this.appointmentService.createResource(ctx, input);
    }

    @Mutation()
    @Allow(appointmentPermission.Update)
    updateAppointmentResource(
        @Ctx() ctx: RequestContext,
        @Args('id') id: ID,
        @Args('input') input: {
            code?: string;
            name?: string;
            resourceType?: string;
            description?: string | null;
            isActive?: boolean;
        },
    ): Promise<AppointmentResource> {
        return this.appointmentService.updateResource(ctx, id, input);
    }

    @Mutation()
    @Allow(appointmentPermission.Create)
    createAppointmentSlot(
        @Ctx() ctx: RequestContext,
        @Args('resourceId') resourceId: ID,
        @Args('startsAt', { type: () => Date }) startsAt: Date,
        @Args('endsAt', { type: () => Date }) endsAt: Date,
    ): Promise<AppointmentSlot> {
        return this.appointmentService.createSlot(ctx, { resourceId, startsAt, endsAt });
    }

    @Mutation()
    @Allow(appointmentPermission.Update)
    setAppointmentSlotActive(
        @Ctx() ctx: RequestContext,
        @Args('id') id: ID,
        @Args('isActive') isActive: boolean,
    ): Promise<AppointmentSlot> {
        return this.appointmentService.setSlotActive(ctx, id, isActive);
    }

    @Mutation()
    @Allow(appointmentPermission.Create)
    createAppointmentBooking(
        @Ctx() ctx: RequestContext,
        @Args('input') input: {
            slotId: ID;
            customerId?: ID | null;
            subjectType?: string | null;
            subjectId?: string | null;
            notes?: string | null;
        },
    ): Promise<AppointmentBooking> {
        return this.bookingService.book(ctx, input);
    }

    @Mutation()
    @Allow(appointmentPermission.Update)
    cancelAppointmentBooking(@Ctx() ctx: RequestContext, @Args('id') id: ID): Promise<AppointmentBooking> {
        return this.bookingService.cancel(ctx, id);
    }

    @Mutation()
    @Allow(appointmentPermission.Update)
    rescheduleAppointmentBooking(
        @Ctx() ctx: RequestContext,
        @Args('id') id: ID,
        @Args('newSlotId') newSlotId: ID,
    ): Promise<AppointmentBooking> {
        return this.bookingService.reschedule(ctx, id, newSlotId);
    }

    @Mutation()
    @Allow(appointmentPermission.Update)
    completeAppointmentBooking(@Ctx() ctx: RequestContext, @Args('id') id: ID): Promise<AppointmentBooking> {
        return this.bookingService.complete(ctx, id);
    }
}
