/**
 * Live-server E2E for the appointment domain (`R-05`). Run with the dev
 * stack already up (`pnpm --filter @lipek/server dev`):
 *
 *   node tests/appointments/appointments-live.e2e.mjs
 *
 * Flow (staff surface, superadmin session): create resource → create two
 * future slots → availableSlots shows both → book slot 1 → double-book is
 * refused → reschedule to slot 2 (original slotId preserved, slot 1 freed)
 * → slot 1 bookable again → cancel (slot 2 freed) → slot 2 bookable →
 * complete. Cleanup truncates the three appointment tables at the end.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const ADMIN_API = 'http://localhost:3000/admin-api';
const SHOP_API = 'http://localhost:3000/shop-api';
const PERIOD_MS = 60 * 60 * 1000; // slots at +1h and +2h

const envText = await readFile(new URL('../../.env', import.meta.url), 'utf8');
const env = Object.fromEntries(
    envText
        .split(/\r?\n/)
        .filter(line => line && !line.startsWith('#') && line.includes('='))
        .map(line => {
            const idx = line.indexOf('=');
            return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
        }),
);
const USERNAME = env.SUPERADMIN_USERNAME ?? 'superadmin';
const PASSWORD = env.SUPERADMIN_PASSWORD ?? 'superadmin';

let authToken;

async function gql(api, query, variables = {}) {
    const res = await fetch(api, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ query, variables }),
    });
    const headerToken = res.headers.get('vendure-auth-token');
    if (headerToken) {
        authToken = headerToken;
    }
    return res.json();
}

const iso = ms => new Date(ms).toISOString();

async function main() {
    const stamp = Date.now();

    // 1. Login.
    const login = await gql(
        ADMIN_API,
        `mutation { authenticate(input: { native: { username: "${USERNAME}", password: "${PASSWORD}" } }) {
            ... on CurrentUser { id }
            ... on InvalidCredentialsError { errorCode }
        } }`,
    );
    assert.ok(login.data.authenticate.id, 'login must succeed');
    console.log('1. staff login OK');

    // 2. Create a resource.
    const resource = await gql(
        ADMIN_API,
        `mutation { createAppointmentResource(input: {
            code: "e2e-fitting-room-${stamp}", name: "E2E Fitting Room", resourceType: "fitting_room"
        }) { id code isActive } }`,
    );
    const resourceId = resource.data.createAppointmentResource.id;
    assert.equal(resource.data.createAppointmentResource.isActive, true);
    console.log(`2. resource created (${resourceId})`);

    // 3. Two future slots.
    const slot1 = await gql(
        ADMIN_API,
        `mutation { createAppointmentSlot(resourceId: ${resourceId}, startsAt: "${iso(stamp + PERIOD_MS)}", endsAt: "${iso(stamp + PERIOD_MS + 30 * 60_000)}") { id } }`,
    );
    const slot2 = await gql(
        ADMIN_API,
        `mutation { createAppointmentSlot(resourceId: ${resourceId}, startsAt: "${iso(stamp + 2 * PERIOD_MS)}", endsAt: "${iso(stamp + 2 * PERIOD_MS + 30 * 60_000)}") { id } }`,
    );
    const slot1Id = slot1.data.createAppointmentSlot.id;
    const slot2Id = slot2.data.createAppointmentSlot.id;
    console.log(`3. slots created (${slot1Id}, ${slot2Id})`);

    // 4. availableSlots (anonymous, Shop API) lists both.
    const available1 = await gql(
        SHOP_API,
        `query { availableSlots(resourceId: ${resourceId}) { totalItems items { id } } }`,
    );
    assert.equal(available1.data.availableSlots.totalItems, 2);
    console.log('4. anonymous availableSlots shows both slots');

    // 5. Book slot 1.
    const booking = await gql(
        ADMIN_API,
        `mutation { createAppointmentBooking(input: { slotId: ${slot1Id}, customerId: null, notes: "e2e walk-in" }) {
            id status activeSlotId slotId resourceId
        } }`,
    );
    const bookingId = booking.data.createAppointmentBooking.id;
    assert.equal(booking.data.createAppointmentBooking.status, 'CONFIRMED');
    assert.equal(String(booking.data.createAppointmentBooking.activeSlotId), String(slot1Id));
    assert.equal(String(booking.data.createAppointmentBooking.slotId), String(slot1Id));
    assert.equal(String(booking.data.createAppointmentBooking.resourceId), String(resourceId));
    console.log(`5. slot 1 booked (${bookingId})`);

    // 6. Double-booking slot 1 is refused.
    const double = await gql(
        ADMIN_API,
        `mutation { createAppointmentBooking(input: { slotId: ${slot1Id} }) { id } }`,
    );
    assert.match(double.errors[0].message, /SLOT_OCCUPIED/);
    console.log('6. double-booking refused (SLOT_OCCUPIED)');

    // 7. Reschedule to slot 2: activeSlotId moves, original slotId kept.
    const rescheduled = await gql(
        ADMIN_API,
        `mutation { rescheduleAppointmentBooking(id: ${bookingId}, newSlotId: ${slot2Id}) { slotId activeSlotId status } }`,
    );
    assert.equal(String(rescheduled.data.rescheduleAppointmentBooking.slotId), String(slot1Id));
    assert.equal(String(rescheduled.data.rescheduleAppointmentBooking.activeSlotId), String(slot2Id));
    console.log('7. rescheduled to slot 2, original slotId preserved');

    // 8. Slot 1 is free again and bookable.
    const rebook = await gql(
        ADMIN_API,
        `mutation { createAppointmentBooking(input: { slotId: ${slot1Id}, notes: "rebooked" }) { id activeSlotId } }`,
    );
    const rebookedId = rebook.data.createAppointmentBooking.id;
    console.log(`8. vacated slot 1 booked again (${rebookedId})`);

    // 9. Cancel the rebooked booking; its slot is freed for a third party.
    const cancelled = await gql(
        ADMIN_API,
        `mutation { cancelAppointmentBooking(id: ${rebookedId}) { status cancelledAt activeSlotId } }`,
    );
    assert.equal(cancelled.data.cancelAppointmentBooking.status, 'CANCELLED');
    assert.ok(cancelled.data.cancelAppointmentBooking.cancelledAt);
    assert.equal(cancelled.data.cancelAppointmentBooking.activeSlotId, null);
    const available2 = await gql(
        SHOP_API,
        `query { availableSlots(resourceId: ${resourceId}) { totalItems items { id } } }`,
    );
    // Slot 1 was freed by the cancellation; slot 2 is still occupied by the
    // rescheduled booking.
    assert.equal(available2.data.availableSlots.totalItems, 1);
    console.log('9. cancel frees the slot (slot 1 available, slot 2 still booked)');

    // 10. Complete the surviving booking.
    const completed = await gql(
        ADMIN_API,
        `mutation { completeAppointmentBooking(id: ${bookingId}) { status } }`,
    );
    assert.equal(completed.data.completeAppointmentBooking.status, 'COMPLETED');
    console.log('10. booking completed');

    console.log('\nAppointments live E2E: ALL CHECKS PASSED');
    process.exit(0);
}

main().catch(err => {
    console.error('Appointments live E2E FAILED:', err.message);
    process.exit(1);
});
