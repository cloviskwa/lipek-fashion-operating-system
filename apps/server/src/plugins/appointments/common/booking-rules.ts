/**
 * Pure booking rules (`R-05`) — no database, no framework, fully unit-testable.
 *
 * The status vocabulary and the transition/validation rules are rebuild-time
 * decisions: the surviving schema fixes only the column shape (varchar,
 * default `'CONFIRMED'`, nullable `cancelledAt`, nullable-and-UNIQUE
 * `activeSlotId`) and carries no CHECK constraint and no rows.
 *
 * The vocabulary is deliberately minimal: `CONFIRMED` (the schema's own
 * default), `CANCELLED` (stamps `cancelledAt` and frees the slot) and
 * `COMPLETED` (closed out by staff). Everything else — reminders, no-shows —
 * is unwritten business territory and must not be invented here.
 */

export const BOOKING_STATUS_CONFIRMED = 'CONFIRMED';
export const BOOKING_STATUS_CANCELLED = 'CANCELLED';
export const BOOKING_STATUS_COMPLETED = 'COMPLETED';

export const BOOKING_STATUSES = [
    BOOKING_STATUS_CONFIRMED,
    BOOKING_STATUS_CANCELLED,
    BOOKING_STATUS_COMPLETED,
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/**
 * Allowed transitions. Terminal states (`CANCELLED`, `COMPLETED`) accept no
 * further transitions — a cancelled booking cannot be resurrected by
 * accident; staff create a new booking instead.
 */
const ALLOWED_TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
    CONFIRMED: [BOOKING_STATUS_CANCELLED, BOOKING_STATUS_COMPLETED],
    CANCELLED: [],
    COMPLETED: [],
};

export function isBookingStatus(value: string): value is BookingStatus {
    return (BOOKING_STATUSES as readonly string[]).includes(value);
}

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
    return ALLOWED_TRANSITIONS[from].includes(to);
}

/** The minimal shape of a slot the rules need — keeps the rules pure. */
export interface SlotFacts {
    id: string | number;
    isActive: boolean;
    startsAt: Date;
    endsAt: Date;
}

/** Whether some booking already occupies the slot (UNIQUE activeSlotId). */
export type SlotOccupancy = boolean;

export type BookingSlotCheck =
    | { ok: true }
    | { ok: false; reason: 'SLOT_INACTIVE' | 'SLOT_IN_PAST' | 'SLOT_ALREADY_ENDED' | 'SLOT_OCCUPIED' };

/**
 * Validate that a slot may be newly reserved *right now*.
 *
 * `now` is injected so the rules stay deterministic under test. The slot
 * must be active, must not have started yet (booking begins before the
 * window, never inside or after it), and must not be occupied.
 */
export function checkSlotForBooking(slot: SlotFacts, occupied: SlotOccupancy, now: Date): BookingSlotCheck {
    if (!slot.isActive) {
        return { ok: false, reason: 'SLOT_INACTIVE' };
    }
    if (slot.endsAt.getTime() <= now.getTime()) {
        return { ok: false, reason: 'SLOT_ALREADY_ENDED' };
    }
    if (slot.startsAt.getTime() <= now.getTime()) {
        return { ok: false, reason: 'SLOT_IN_PAST' };
    }
    if (occupied) {
        return { ok: false, reason: 'SLOT_OCCUPIED' };
    }
    return { ok: true };
}

/**
 * A reschedule targets a slot other than the one currently occupied and
 * must satisfy the same booking rules as a fresh booking.
 */
export function checkSlotForReschedule(
    bookingActiveSlotId: string | number | null,
    slot: SlotFacts,
    occupied: SlotOccupancy,
    now: Date,
): BookingSlotCheck {
    if (bookingActiveSlotId != null && String(bookingActiveSlotId) === String(slot.id)) {
        // Rescheduling onto the currently occupied slot is a no-op, not a
        // booking — rejected so the caller surfaces it as user error.
        return { ok: false, reason: 'SLOT_OCCUPIED' };
    }
    return checkSlotForBooking(slot, occupied, now);
}
