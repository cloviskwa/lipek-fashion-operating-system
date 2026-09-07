import { ID } from '@vendure/common/lib/shared-types';

import {
    BACKWARD_TRANSITIONS,
    CUSTOMER_NOTIFYING_STAGES,
    OPERATIONAL_STAGES,
    ServiceStage,
} from './stage-definitions';

/**
 * The transition engine shared by the Tailoring, Alterations and Laundry
 * plugins (`ADR-0014`, implementing SOT §9A).
 *
 * Pure and framework-free on purpose: it decides whether a transition is
 * legal and what the resulting timeline looks like, and knows nothing about
 * TypeORM, GraphQL or notifications. The calling plugin persists the result
 * and emits the event. That keeps the rules — the part the business cares
 * about — testable without a database.
 */

/** JSON shapes held in the timeline tables' `text` columns (ADR-0014 §3). */
export type StageTimestamps = Partial<Record<ServiceStage, string>>;
export type StageActorIds = Partial<Record<ServiceStage, string>>;

export interface TimelineState {
    currentStage: ServiceStage;
    stageTimestamps: StageTimestamps;
    stageActorIds: StageActorIds;
}

export interface TransitionActor {
    administratorId: ID;
    /** Supervisors may advance any job, so absence never blocks work. */
    isSupervisor: boolean;
}

export interface TransitionRequest {
    sequence: readonly ServiceStage[];
    state: TimelineState;
    to: ServiceStage;
    actor: TransitionActor;
    /** The job's assigned staff member, if it has one. */
    assignedStaffId?: ID | null;
    /** Set when the job has been cancelled; blocks all further transitions. */
    cancelledAt?: Date | null;
    /** Injected so transitions are deterministic under test. */
    now?: Date;
}

export type TransitionOutcome =
    | { ok: true; state: TimelineState; notifiesCustomer: boolean }
    | { ok: false; reason: TransitionRefusal; message: string };

export type TransitionRefusal =
    | 'UNKNOWN_STAGE'
    | 'JOB_CANCELLED'
    | 'ALREADY_AT_STAGE'
    | 'BACKWARD_NOT_ALLOWED'
    | 'NOT_ASSIGNED_STAFF';

function isBackwardAllowed(from: ServiceStage, to: ServiceStage): boolean {
    return BACKWARD_TRANSITIONS.some(([f, t]) => f === from && t === to);
}

/**
 * Decide a stage transition.
 *
 * Returns a refusal rather than throwing so the caller can map each reason
 * onto its own error type, and so the rules stay usable outside a request.
 */
export function transition(request: TransitionRequest): TransitionOutcome {
    const { sequence, state, to, actor, assignedStaffId, cancelledAt } = request;
    const now = request.now ?? new Date();

    const fromIndex = sequence.indexOf(state.currentStage);
    const toIndex = sequence.indexOf(to);

    if (toIndex === -1 || fromIndex === -1) {
        return {
            ok: false,
            reason: 'UNKNOWN_STAGE',
            message: `"${toIndex === -1 ? to : state.currentStage}" is not a stage of this workflow`,
        };
    }

    // A cancelled job keeps the stage it had reached but accepts nothing more
    // (ADR-0014 §4).
    if (cancelledAt) {
        return {
            ok: false,
            reason: 'JOB_CANCELLED',
            message: 'This job was cancelled and can no longer be advanced',
        };
    }

    if (toIndex === fromIndex) {
        return {
            ok: false,
            reason: 'ALREADY_AT_STAGE',
            message: `This job is already at ${to}`,
        };
    }

    // Forward skips are allowed; backward moves are not, except the single
    // documented FINAL_FITTING → ADJUSTMENTS return (ADR-0014 §5.1, §5.2).
    if (toIndex < fromIndex && !isBackwardAllowed(state.currentStage, to)) {
        return {
            ok: false,
            reason: 'BACKWARD_NOT_ALLOWED',
            message: `Cannot move backwards from ${state.currentStage} to ${to}`,
        };
    }

    // Work on the garment is attributable, so only the assigned staff member
    // or a supervisor may record it (ADR-0014 §5.4). An unassigned job is
    // open to anyone with the permission.
    if (OPERATIONAL_STAGES.has(to) && !actor.isSupervisor && assignedStaffId != null) {
        if (String(assignedStaffId) !== String(actor.administratorId)) {
            return {
                ok: false,
                reason: 'NOT_ASSIGNED_STAFF',
                message: `${to} may only be recorded by the assigned staff member or a supervisor`,
            };
        }
    }

    return {
        ok: true,
        notifiesCustomer: CUSTOMER_NOTIFYING_STAGES.has(to),
        state: {
            currentStage: to,
            // Re-entering a stage overwrites its timestamp: staff ask when a
            // job *last* entered adjustments, not when it first did.
            stageTimestamps: { ...state.stageTimestamps, [to]: now.toISOString() },
            stageActorIds: { ...state.stageActorIds, [to]: String(actor.administratorId) },
        },
    };
}

/**
 * The stages a job passed through, in sequence order.
 *
 * Reads the timestamp map rather than assuming every earlier stage was
 * visited, so skipped stages are correctly absent.
 */
export function completedStages(
    sequence: readonly ServiceStage[],
    timestamps: StageTimestamps,
): ServiceStage[] {
    return sequence.filter(stage => timestamps[stage] != null);
}

/** The stages between the current one and the end, for progress display. */
export function remainingStages(
    sequence: readonly ServiceStage[],
    currentStage: ServiceStage,
): ServiceStage[] {
    const index = sequence.indexOf(currentStage);
    return index === -1 ? [] : [...sequence.slice(index + 1)];
}
