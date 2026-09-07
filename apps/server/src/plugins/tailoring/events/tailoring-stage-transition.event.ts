import { RequestContext, VendureEvent } from '@vendure/core';

import { ProductionTimeline } from '../entities/production-timeline.entity';
import { TailoringJob } from '../entities/tailoring-job.entity';
import { TailoringStage } from '../../../common/service-workflow/stage-definitions';

/**
 * Published on every production stage transition (`R-06`, `ADR-0014`).
 *
 * ADR-0014 requires one named event per transition in the catalog (eleven
 * forward plus the `FINAL_FITTING → ADJUSTMENTS` rework loop); they are
 * carried by this single class with `fromStage`/`toStage` so consumers can
 * subscribe to the class and filter on the stage pair, instead of this
 * module shipping eleven identical classes. The notification side effects
 * (QUEUED records for handover stages) are the production service's job.
 */
export class TailoringStageTransitionEvent extends VendureEvent {
    constructor(
        public readonly ctx: RequestContext,
        public readonly job: TailoringJob,
        public readonly timeline: ProductionTimeline,
        public readonly fromStage: TailoringStage,
        public readonly toStage: TailoringStage,
        /** True when the target stage is one of ADR-0014 §5.5's notifying stages. */
        public readonly notifiesCustomer: boolean,
    ) {
        super();
    }
}
