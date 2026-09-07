import { RequestContext, VendureEvent } from '@vendure/core';

import { TailoringJob } from '../entities/tailoring-job.entity';

/**
 * Published when a tailoring job is created (`R-06`). The job starts at
 * `ORDER_CONFIRMED` with its production timeline; the commercial side lives
 * on the referenced order.
 */
export class TailoringJobCreated extends VendureEvent {
    constructor(public readonly ctx: RequestContext, public readonly job: TailoringJob) {
        super();
    }
}
