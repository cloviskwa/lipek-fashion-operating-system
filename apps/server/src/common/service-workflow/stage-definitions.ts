/**
 * Stage vocabularies for the three service workflows, per `ADR-0014`.
 *
 * Transcribed from the source of truth — §10.2 Tailoring Workflow, §12.2
 * Alteration Tracking, §13.2 Laundry Tracking. **Do not add, rename or
 * reorder a stage without amending the SOT and the ADR first**: these are
 * product definitions, not implementation details.
 *
 * Values are stored in the timeline tables' `currentStage` varchar columns.
 * Display labels belong to the presentation layer, so that SOT §9A's
 * "state labels may be localized" holds without the stored value moving.
 */

export const TAILORING_STAGES = [
    'ORDER_CONFIRMED',
    'MEASUREMENTS_TAKEN',
    'FABRIC_CONFIRMED',
    'PATTERN_CREATED',
    'CUTTING',
    'SEWING',
    'FIRST_FITTING',
    'ADJUSTMENTS',
    'FINAL_FITTING',
    'QUALITY_CONTROL',
    'READY_FOR_HANDOVER',
    'COMPLETED',
] as const;

export const ALTERATION_STAGES = [
    'RECEIVED',
    'ASSESSMENT',
    'QUOTE_APPROVED',
    'IN_ALTERATION',
    'QUALITY_CHECK',
    'READY_FOR_PICKUP',
    'COMPLETED',
] as const;

export const LAUNDRY_STAGES = [
    'ORDER_RECEIVED',
    'GARMENTS_COLLECTED',
    'INSPECTION',
    'CLEANING',
    'STAIN_TREATMENT',
    'PRESSING',
    'QUALITY_CHECK',
    'PACKAGING',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
] as const;

export type TailoringStage = (typeof TAILORING_STAGES)[number];
export type AlterationStage = (typeof ALTERATION_STAGES)[number];
export type LaundryStage = (typeof LAUNDRY_STAGES)[number];
export type ServiceStage = TailoringStage | AlterationStage | LaundryStage;

/**
 * Transitions that run against the sequence.
 *
 * ADR-0014 §5.2 permits exactly one: a failed final fitting returns the
 * garment to the bench. Everything else is forward-only.
 */
export const BACKWARD_TRANSITIONS: ReadonlyArray<readonly [ServiceStage, ServiceStage]> = [
    ['FINAL_FITTING', 'ADJUSTMENTS'],
];

/**
 * Stages whose entry notifies the customer (ADR-0014 §5.5).
 *
 * Deliberately only those that ask the customer to act or that complete the
 * service. Intermediate production stages are visible in tracking but silent.
 */
export const CUSTOMER_NOTIFYING_STAGES: ReadonlySet<ServiceStage> = new Set([
    'READY_FOR_HANDOVER',
    'READY_FOR_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
]);

/**
 * Stages that represent physical work on the garment, and so require the
 * actor to be the assigned staff member or a supervisor (ADR-0014 §5.4).
 *
 * The intake and handover ends of each workflow are excluded: front-of-house
 * staff receive and release garments regardless of who works on them.
 */
export const OPERATIONAL_STAGES: ReadonlySet<ServiceStage> = new Set([
    'PATTERN_CREATED',
    'CUTTING',
    'SEWING',
    'ADJUSTMENTS',
    'QUALITY_CONTROL',
    'IN_ALTERATION',
    'QUALITY_CHECK',
    'CLEANING',
    'STAIN_TREATMENT',
    'PRESSING',
    'PACKAGING',
]);

/** The stage each workflow starts at when its job is created. */
export const INITIAL_STAGE = {
    tailoring: 'ORDER_CONFIRMED',
    alteration: 'RECEIVED',
    laundry: 'ORDER_RECEIVED',
} as const;
