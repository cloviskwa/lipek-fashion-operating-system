/**
 * Live-server E2E for the tailoring module (`R-06`). Run with the dev stack
 * already up (`pnpm --filter @lipek/server dev`):
 *
 *   node tests/tailoring/tailoring-live.e2e.mjs
 *
 * Flow: create job (timeline at ORDER_CONFIRMED) → skip forward to SEWING →
 * backward move refused → the fitting rework loop (the one permitted
 * backward transition) → cancel the job → further transitions refused.
 * Cleanup truncates the touched tables.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const ADMIN_API = 'http://localhost:3000/admin-api';

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

async function gql(query, variables = {}) {
    const res = await fetch(ADMIN_API, {
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
        `mutation { authenticate(input: { native: { username: "${USERNAME}", password: "${PASSWORD}" } }) {
            ... on CurrentUser { id }
        } }`,
    );
    assert.ok(login.data.authenticate.id, 'login must succeed');
    console.log('1. login OK');

    // 2. Create the job (and its timeline).
    const job = await gql(
        `mutation { createTailoringJob(input: { orderId: 1, customerId: 1, serviceName: "E2E Three-Piece Suit" }) {
            id jobNumber timeline { currentStage stageTimestamps }
        } }`,
    );
    const jobId = job.data.createTailoringJob.id;
    assert.match(job.data.createTailoringJob.jobNumber, /^TJ-/);
    assert.equal(job.data.createTailoringJob.timeline.currentStage, 'ORDER_CONFIRMED');
    console.log(`2. job created (${job.data.createTailoringJob.jobNumber})`);

    // 3. Skip forward: ORDER_CONFIRMED → SEWING.
    const sew = await gql(
        `mutation { transitionTailoringStage(jobId: ${jobId}, to: "SEWING") { currentStage stageTimestamps } }`,
    );
    assert.equal(sew.data.transitionTailoringStage.currentStage, 'SEWING');
    assert.ok(sew.data.transitionTailoringStage.stageTimestamps.ORDER_CONFIRMED);
    console.log('3. skip forward to SEWING OK');

    // 4. A backward move that is not the permitted rework loop is refused.
    const back = await gql(
        `mutation { transitionTailoringStage(jobId: ${jobId}, to: "CUTTING") { currentStage } }`,
    );
    assert.match(back.errors[0].message, /BACKWARD_NOT_ALLOWED|backward/i);
    console.log('4. illegal backward move refused');

    // 5. Forward through the fitting stages, then the permitted rework loop.
    for (const stage of ['FIRST_FITTING', 'FINAL_FITTING']) {
        const r = await gql(`mutation { transitionTailoringStage(jobId: ${jobId}, to: "${stage}") { currentStage } }`);
        assert.equal(r.data.transitionTailoringStage.currentStage, stage);
    }
    const rework = await gql(
        `mutation { transitionTailoringStage(jobId: ${jobId}, to: "ADJUSTMENTS") { currentStage } }`,
    );
    assert.equal(rework.data.transitionTailoringStage.currentStage, 'ADJUSTMENTS');
    const final = await gql(
        `mutation { transitionTailoringStage(jobId: ${jobId}, to: "FINAL_FITTING") { currentStage } }`,
    );
    assert.equal(final.data.transitionTailoringStage.currentStage, 'FINAL_FITTING');
    console.log('5. fitting rework loop (FINAL_FITTING → ADJUSTMENTS → FINAL_FITTING) OK');

    // 6. Reserve an AppointmentsPlugin slot for a fitting.
    const resource = await gql(
        `mutation { createAppointmentResource(input: { code: "e2e-tailoring-${stamp}", name: "E2E Fitting Room", resourceType: "fitting_room" }) { id } }`,
    );
    const resourceId = resource.data.createAppointmentResource.id;
    const starts = iso(Date.now() + 24 * 60 * 60_000);
    const slot = await gql(
        `mutation { createAppointmentSlot(resourceId: ${resourceId}, startsAt: "${starts}", endsAt: "${iso(Date.now() + 24 * 60 * 60_000 + 30 * 60_000)}") { id } }`,
    );
    const slotId = slot.data.createAppointmentSlot.id;
    const fitting = await gql(
        `mutation { scheduleFitting(input: { tailoringJobId: ${jobId}, fittingType: "SECOND_FITTING", scheduledAt: "${starts}", bookSlotId: ${slotId}, location: "Studio" }) {
            id status appointmentBookingId
        } }`,
    );
    const bookingId = fitting.data.scheduleFitting.appointmentBookingId;
    assert.ok(bookingId, 'the fitting must have reserved an appointment booking');
    console.log(`6. fitting scheduled with slot booking (booking ${bookingId})`);

    // 7. Cancel the job; further transitions are refused.
    const cancelled = await gql(`mutation { cancelTailoringJob(id: ${jobId}) { cancelledAt } }`);
    assert.ok(cancelled.data.cancelTailoringJob.cancelledAt);
    const after = await gql(
        `mutation { transitionTailoringStage(jobId: ${jobId}, to: "QUALITY_CONTROL") { currentStage } }`,
    );
    assert.match(after.errors[0].message, /cancel/i);
    console.log('7. cancelled job refuses further transitions');

    console.log('\nTailoring live E2E: ALL CHECKS PASSED');
    process.exit(0);
}

main().catch(err => {
    console.error('Tailoring live E2E FAILED:', err.message);
    process.exit(1);
});
