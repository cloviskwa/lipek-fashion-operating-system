import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, ID, Permission, RequestContext, UserInputError } from '@vendure/core';

import { CustomerService } from '@vendure/core';

import { AppointmentBooking } from '../entities/appointment-booking.entity';
import { AppointmentService } from '../services/appointment.service';
import { BookingService } from '../services/booking.service';

/**
 * Customer booking surface (`R-05`, SOT §19.1 "My Appointments" / §9
 * "Book Measurement Appointment"): browse available slots, book, view and
 * cancel own bookings. Ownership is the authorization — every mutation is
 * scoped server-side to the session customer's id.
 */
@Resolver()
export class AppointmentShopResolver {
    constructor(
        private appointmentService: AppointmentService,
        private bookingService: BookingService,
        private customerService: CustomerService,
    ) {}

    private async currentCustomerId(ctx: RequestContext): Promise<ID> {
        const customer = ctx.activeUserId
            ? await this.customerService.findOneByUserId(ctx, ctx.activeUserId)
            : undefined;
        if (!customer) {
            throw new UserInputError('No customer account is signed in.');
        }
        return customer.id;
    }

    @Query()
    @Allow(Permission.Public)
    availableSlots(
        @Ctx() ctx: RequestContext,
        @Args() args: { resourceId?: ID | null; from?: Date | null; to?: Date | null; options?: any },
    ): Promise<any> {
        return this.bookingService.availableSlots(
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
    @Allow(Permission.Authenticated)
    async myAppointmentBookings(
        @Ctx() ctx: RequestContext,
        @Args() args: { options?: any },
    ): Promise<any> {
        const customerId = await this.currentCustomerId(ctx);
        return this.bookingService.bookings(ctx, args.options, { customerId });
    }

    @Mutation()
    @Allow(Permission.Authenticated)
    async bookAppointment(
        @Ctx() ctx: RequestContext,
        @Args('slotId') slotId: ID,
        @Args('notes', { nullable: true }) notes?: string | null,
    ): Promise<AppointmentBooking> {
        const customerId = await this.currentCustomerId(ctx);
        return this.bookingService.book(ctx, { slotId, customerId, notes: notes ?? null });
    }

    @Mutation()
    @Allow(Permission.Authenticated)
    async cancelMyAppointmentBooking(@Ctx() ctx: RequestContext, @Args('id') id: ID): Promise<AppointmentBooking> {
        const customerId = await this.currentCustomerId(ctx);
        const booking = await this.bookingService.booking(ctx, id);
        if (!booking || String(booking.customerId) !== String(customerId)) {
            throw new UserInputError('Unknown booking.');
        }
        return this.bookingService.cancel(ctx, id);
    }
}
