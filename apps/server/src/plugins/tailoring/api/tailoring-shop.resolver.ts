import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, ID, Permission, RequestContext, UserInputError } from '@vendure/core';

import { CustomerService } from '@vendure/core';

import { TailoringService } from '../services/tailoring.service';
import { MeasurementService } from '../services/measurement.service';

/**
 * Customer surface (`R-06`, SOT §19.1 "My Appointments" / job tracking §22.2):
 * customers see their own jobs' production progress and manage their
 * measurement profiles. Ownership is enforced server-side via the session
 * customer.
 */
@Resolver()
export class TailoringShopResolver {
    constructor(
        private tailoringService: TailoringService,
        private measurementService: MeasurementService,
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
    @Allow(Permission.Authenticated)
    async myTailoringJobs(@Ctx() ctx: RequestContext): Promise<any> {
        const customerId = await this.currentCustomerId(ctx);
        return this.tailoringService.jobs(ctx, undefined, { customerId });
    }

    @Query()
    @Allow(Permission.Authenticated)
    async myMeasurementProfiles(@Ctx() ctx: RequestContext): Promise<any> {
        const customerId = await this.currentCustomerId(ctx);
        return this.measurementService.profiles(ctx, undefined, { customerId });
    }

    @Mutation()
    @Allow(Permission.Authenticated)
    async createMyMeasurementProfile(
        @Ctx() ctx: RequestContext,
        @Args('measurements') measurements: string,
        @Args('label', { nullable: true }) label?: string | null,
        @Args('notes', { nullable: true }) notes?: string | null,
    ) {
        const customerId = await this.currentCustomerId(ctx);
        // Customer-provided values are marked as such — staff can amend.
        return this.measurementService.createProfile(ctx, {
            customerId,
            measurements,
            source: 'customer_provided',
            label: label ?? null,
            notes: notes ?? null,
        });
    }
}
