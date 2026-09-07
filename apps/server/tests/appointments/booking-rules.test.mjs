import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const pluginRoot = path.join(import.meta.dirname, '..', '..', 'src', 'plugins', 'appointments');

/**
 * The booking rules are pure decisions recorded at rebuild time — the status
 * vocabulary, the transition table and the slot-eligibility checks — and are
 * pinned here independently of any database, the same way the
 * service-workflow stage machine is.
 */
async function loadRules() {
    const source = await readFile(path.join(pluginRoot, 'common', 'booking-rules.ts'), 'utf8');
    const { outputText } = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    });
    return import(
        `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
    );
}

const NOW = new Date('2026-09-10T09:00:00.000Z');
const futureSlot = (id = 1, startOffsetMin = 60) => ({
    id,
    isActive: true,
    startsAt: new Date(NOW.getTime() + startOffsetMin * 60_000),
    endsAt: new Date(NOW.getTime() + (startOffsetMin + 30) * 60_000),
});

test('the status vocabulary is exactly the decided set', async () => {
    const rules = await loadRules();
    assert.deepEqual([...rules.BOOKING_STATUSES], ['CONFIRMED', 'CANCELLED', 'COMPLETED']);
});

test('CONFIRMED may move to CANCELLED or COMPLETED; terminals are terminal', async () => {
    const rules = await loadRules();
    assert.equal(rules.canTransition('CONFIRMED', 'CANCELLED'), true);
    assert.equal(rules.canTransition('CONFIRMED', 'COMPLETED'), true);
    assert.equal(rules.canTransition('CANCELLED', 'CONFIRMED'), false);
    assert.equal(rules.canTransition('COMPLETED', 'CONFIRMED'), false);
    assert.equal(rules.canTransition('CONFIRMED', 'CONFIRMED'), false);
});

test('a free, active, future slot is bookable', async () => {
    const rules = await loadRules();
    assert.deepEqual(rules.checkSlotForBooking(futureSlot(), false, NOW), { ok: true });
});

test('inactive, past and already-ended slots are refused with distinct reasons', async () => {
    const rules = await loadRules();
    const inactive = { ...futureSlot(), isActive: false };
    assert.equal(rules.checkSlotForBooking(inactive, false, NOW).reason, 'SLOT_INACTIVE');
    const started = futureSlot(1, -15); // started 15 minutes ago
    assert.equal(rules.checkSlotForBooking(started, false, NOW).reason, 'SLOT_IN_PAST');
    const ended = futureSlot(1, -45); // ended 15 minutes ago
    assert.equal(rules.checkSlotForBooking(ended, false, NOW).reason, 'SLOT_ALREADY_ENDED');
});

test('an occupied slot is refused — the double-booking guard', async () => {
    const rules = await loadRules();
    assert.equal(rules.checkSlotForBooking(futureSlot(), true, NOW).reason, 'SLOT_OCCUPIED');
});

test('reschedule onto the currently occupied slot is refused as a no-op', async () => {
    const rules = await loadRules();
    const slot = futureSlot(7);
    const result = rules.checkSlotForReschedule(7, slot, false, NOW);
    assert.equal(result.reason, 'SLOT_OCCUPIED');
});

test('reschedule onto a different free slot is allowed, and string ids compare safely', async () => {
    const rules = await loadRules();
    assert.deepEqual(rules.checkSlotForReschedule('7', futureSlot(8), false, NOW), { ok: true });
    assert.deepEqual(rules.checkSlotForReschedule(7, futureSlot('8'), false, NOW), { ok: true });
});

test('a cancelled booking frees its slot: the vacated slot passes the fresh-booking check', async () => {
    // Cancel sets activeSlotId to NULL, so the same slot is bookable again
    // — modelled here by occupancy flipping to false after cancellation.
    const rules = await loadRules();
    const slot = futureSlot(3);
    assert.equal(rules.checkSlotForBooking(slot, true, NOW).reason, 'SLOT_OCCUPIED');
    assert.deepEqual(rules.checkSlotForBooking(slot, false, NOW), { ok: true });
});
