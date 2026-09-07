import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const serverRoot = path.join(import.meta.dirname, '..', '..');
const dir = path.join(serverRoot, 'src', 'common', 'service-workflow');

/**
 * The stage machine is pure, so it is transpiled and exercised directly.
 * These rules are the business decisions recorded in ADR-0014 and are worth
 * pinning independently of any database.
 */
async function transpile(file) {
    const {outputText} = ts.transpileModule(await readFile(path.join(dir, file), 'utf8'), {
        compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022},
    });
    return outputText;
}

const definitions = await transpile('stage-definitions.ts');
// Concatenate the two modules and drop the import that joined them, so the
// pair loads from a single data: URL with no resolver involved.
const machine = (await transpile('stage-machine.ts'))
    .replace(/import\s*\{[\s\S]*?\}\s*from\s*["']\.\/stage-definitions["'];?/, '')
    .replace(/import\s*\{[\s\S]*?\}\s*from\s*["']@vendure\/common\/lib\/shared-types["'];?/, '');

const mod = await import(
    `data:text/javascript;base64,${Buffer.from(`${definitions}\n${machine}`).toString('base64')}`
);

const {
    transition,
    completedStages,
    remainingStages,
    TAILORING_STAGES,
    ALTERATION_STAGES,
    LAUNDRY_STAGES,
} = mod;

const NOW = new Date('2026-09-07T10:00:00.000Z');
const supervisor = {administratorId: '1', isSupervisor: true};
const assignedStaff = {administratorId: '7', isSupervisor: false};

const at = stage => ({
    currentStage: stage,
    stageTimestamps: {[stage]: '2026-09-06T09:00:00.000Z'},
    stageActorIds: {[stage]: '7'},
});

test('the SOT sequences are transcribed exactly', () => {
    assert.equal(TAILORING_STAGES.length, 12);
    assert.equal(ALTERATION_STAGES.length, 7);
    assert.equal(LAUNDRY_STAGES.length, 10);
    assert.equal(TAILORING_STAGES[0], 'ORDER_CONFIRMED');
    assert.equal(TAILORING_STAGES.at(-1), 'COMPLETED');
    assert.equal(ALTERATION_STAGES[0], 'RECEIVED');
    assert.equal(LAUNDRY_STAGES.at(-1), 'DELIVERED');
});

test('a forward transition records time and actor', () => {
    const result = transition({
        sequence: TAILORING_STAGES,
        state: at('CUTTING'),
        to: 'SEWING',
        actor: assignedStaff,
        assignedStaffId: '7',
        now: NOW,
    });
    assert.ok(result.ok);
    assert.equal(result.state.currentStage, 'SEWING');
    assert.equal(result.state.stageTimestamps.SEWING, NOW.toISOString());
    assert.equal(result.state.stageActorIds.SEWING, '7');
});

test('stages may be skipped forward, and a skip stays absent', () => {
    const result = transition({
        sequence: LAUNDRY_STAGES,
        state: at('CLEANING'),
        to: 'PRESSING', // STAIN_TREATMENT does not apply to this job
        actor: supervisor,
        now: NOW,
    });
    assert.ok(result.ok);
    assert.equal(
        result.state.stageTimestamps.STAIN_TREATMENT,
        undefined,
        'a skipped stage must stay absent so it is distinguishable from pending',
    );
});

test('FINAL_FITTING may return to ADJUSTMENTS, and nothing else may go back', () => {
    const permitted = transition({
        sequence: TAILORING_STAGES,
        state: at('FINAL_FITTING'),
        to: 'ADJUSTMENTS',
        actor: supervisor,
        now: NOW,
    });
    assert.ok(permitted.ok, 'the one documented backward transition must be allowed');

    const refused = transition({
        sequence: TAILORING_STAGES,
        state: at('QUALITY_CONTROL'),
        to: 'CUTTING',
        actor: supervisor,
        now: NOW,
    });
    assert.equal(refused.ok, false);
    assert.equal(refused.reason, 'BACKWARD_NOT_ALLOWED');
});

test('re-entering a stage overwrites its timestamp with the later time', () => {
    const state = {
        currentStage: 'FINAL_FITTING',
        stageTimestamps: {
            ADJUSTMENTS: '2026-09-01T09:00:00.000Z',
            FINAL_FITTING: '2026-09-05T09:00:00.000Z',
        },
        stageActorIds: {ADJUSTMENTS: '3'},
    };
    const result = transition({
        sequence: TAILORING_STAGES,
        state,
        to: 'ADJUSTMENTS',
        actor: supervisor,
        now: NOW,
    });
    assert.ok(result.ok);
    assert.equal(result.state.stageTimestamps.ADJUSTMENTS, NOW.toISOString());
    assert.equal(result.state.stageActorIds.ADJUSTMENTS, '1');
});

test('operational stages are restricted to the assigned staff member', () => {
    const byOther = transition({
        sequence: TAILORING_STAGES,
        state: at('PATTERN_CREATED'),
        to: 'CUTTING',
        actor: {administratorId: '9', isSupervisor: false},
        assignedStaffId: '7',
        now: NOW,
    });
    assert.equal(byOther.ok, false);
    assert.equal(byOther.reason, 'NOT_ASSIGNED_STAFF');

    const bySupervisor = transition({
        sequence: TAILORING_STAGES,
        state: at('PATTERN_CREATED'),
        to: 'CUTTING',
        actor: supervisor,
        assignedStaffId: '7',
        now: NOW,
    });
    assert.ok(bySupervisor.ok, 'a supervisor must never be blocked');

    const unassigned = transition({
        sequence: TAILORING_STAGES,
        state: at('PATTERN_CREATED'),
        to: 'CUTTING',
        actor: {administratorId: '9', isSupervisor: false},
        assignedStaffId: null,
        now: NOW,
    });
    assert.ok(unassigned.ok, 'an unassigned job is open to any permitted staff member');
});

test('handover stages stay open to front-of-house', () => {
    const result = transition({
        sequence: TAILORING_STAGES,
        state: at('QUALITY_CONTROL'),
        to: 'READY_FOR_HANDOVER',
        actor: {administratorId: '9', isSupervisor: false},
        assignedStaffId: '7',
        now: NOW,
    });
    assert.ok(result.ok, 'releasing a garment is not bench work');
});

test('only the handover stages notify the customer', () => {
    const notifying = transition({
        sequence: ALTERATION_STAGES,
        state: at('QUALITY_CHECK'),
        to: 'READY_FOR_PICKUP',
        actor: supervisor,
        now: NOW,
    });
    assert.ok(notifying.ok);
    assert.equal(notifying.notifiesCustomer, true);

    const silent = transition({
        sequence: TAILORING_STAGES,
        state: at('CUTTING'),
        to: 'SEWING',
        actor: supervisor,
        now: NOW,
    });
    assert.ok(silent.ok);
    assert.equal(silent.notifiesCustomer, false);
});

test('a cancelled job accepts no further transitions', () => {
    const result = transition({
        sequence: TAILORING_STAGES,
        state: at('SEWING'),
        to: 'FIRST_FITTING',
        actor: supervisor,
        cancelledAt: new Date('2026-09-06T12:00:00.000Z'),
        now: NOW,
    });
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'JOB_CANCELLED');
});

test('unknown stages and no-op transitions are refused', () => {
    const unknown = transition({
        sequence: ALTERATION_STAGES,
        state: at('RECEIVED'),
        to: 'CUTTING',
        actor: supervisor,
        now: NOW,
    });
    assert.equal(unknown.reason, 'UNKNOWN_STAGE');

    const noop = transition({
        sequence: ALTERATION_STAGES,
        state: at('RECEIVED'),
        to: 'RECEIVED',
        actor: supervisor,
        now: NOW,
    });
    assert.equal(noop.reason, 'ALREADY_AT_STAGE');
});

test('progress helpers reflect skips rather than assuming a full path', () => {
    const timestamps = {
        ORDER_RECEIVED: 'x',
        GARMENTS_COLLECTED: 'x',
        INSPECTION: 'x',
        CLEANING: 'x',
        PRESSING: 'x',
    };
    assert.deepEqual(completedStages(LAUNDRY_STAGES, timestamps), [
        'ORDER_RECEIVED',
        'GARMENTS_COLLECTED',
        'INSPECTION',
        'CLEANING',
        'PRESSING',
    ]);
    assert.deepEqual(remainingStages(LAUNDRY_STAGES, 'PACKAGING'), ['OUT_FOR_DELIVERY', 'DELIVERED']);
});
