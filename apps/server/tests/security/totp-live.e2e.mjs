/**
 * Live-server E2E for the TOTP ceremony (`R-04`, `SEC-003`). Run with the
 * dev stack already up (`pnpm --filter @lipek/server dev`):
 *
 *   node tests/security/totp-live.e2e.mjs
 *
 * Flow: plain superadmin login → TOTP enrollment → confirm with first code
 * → second factor demanded on next login → replay rejected → fresh code
 * accepted → replay rejected → backup code accepted → backup code single-use
 * → status + audit trail checked → TOTP disabled again (cleanup).
 *
 * Left-over state: audit-log entries documenting the ceremony; the
 * superadmin's TOTP credential is removed in the cleanup step.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { generateSync } from 'otplib';

const ADMIN_API = 'http://localhost:3000/admin-api';
const PERIOD_SECONDS = 30;

// --- config -----------------------------------------------------------------
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

// --- tiny GraphQL client (bearer token from the auth response header) -------
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
    const body = await res.json();
    if (body.errors?.length) {
        throw new Error(`GraphQL error: ${body.errors[0].message}`);
    }
    return body.data;
}

const currentStep = () => Math.floor(Date.now() / 1000 / PERIOD_SECONDS);
const codeFor = step => generateSync({ secret: state.secret, epoch: step * PERIOD_SECONDS, period: PERIOD_SECONDS });
const sleepUntilNextStep = async () => {
    const nowMs = Date.now();
    const wait = PERIOD_SECONDS * 1000 - (nowMs % (PERIOD_SECONDS * 1000)) + 250;
    await new Promise(resolve => setTimeout(resolve, wait));
};

const state = {};

async function main() {
    // 1. Plain password login still works before any factor is enrolled.
    const me = await gql(
        `mutation { authenticate(input: { native: { username: "${USERNAME}", password: "${PASSWORD}" } }) {
            ... on CurrentUser { id identifier }
            ... on InvalidCredentialsError { errorCode }
        } }`,
    );
    assert.ok(me.authenticate.id, 'plain login must succeed before enrollment');
    console.log(`1. plain login OK (user ${me.authenticate.id})`);

    // 2. Start enrollment; keep the secret the server returned.
    const start = await gql(`mutation { startTotpEnrollment { secret otpauthUri } }`);
    assert.match(start.startTotpEnrollment.otpauthUri, /^otpauth:\/\/totp\//);
    state.secret = start.startTotpEnrollment.secret;
    console.log('2. enrollment started, otpauth URI issued');

    // 3. Confirm with the first valid code.
    const confirmCode = codeFor(currentStep());
    const confirm = await gql(`mutation { confirmTotpEnrollment(code: "${confirmCode}") {
        backupCodes
        status { totpEnrolled backupCodesRemaining }
    } }`);
    assert.equal(confirm.confirmTotpEnrollment.status.totpEnrolled, true);
    assert.equal(confirm.confirmTotpEnrollment.backupCodes.length, 10);
    state.backupCodes = confirm.confirmTotpEnrollment.backupCodes;
    const confirmedStep = currentStep();
    console.log('3. enrollment confirmed, 10 backup codes issued');

    // 4. Password-only login is now refused (second factor demanded).
    authToken = undefined;
    const noFactor = await gql(
        `mutation { authenticate(input: { native: { username: "${USERNAME}", password: "${PASSWORD}" } }) {
            ... on CurrentUser { id }
            ... on InvalidCredentialsError { errorCode authenticationError }
        } }`,
    );
    assert.equal(noFactor.authenticate.errorCode, 'INVALID_CREDENTIALS_ERROR');
    assert.equal(noFactor.authenticate.authenticationError, 'MFA_SECOND_FACTOR_REQUIRED');
    console.log('4. password-only login refused with MFA_SECOND_FACTOR_REQUIRED');

    // 5. The confirm-time code cannot be replayed as a login factor.
    const replayConfirm = await gql(
        `mutation { authenticate(input: { native: { username: "${USERNAME}", password: "${PASSWORD}", secondFactorCode: "${confirmCode}" } }) {
            ... on CurrentUser { id }
            ... on InvalidCredentialsError { authenticationError }
        } }`,
    );
    assert.equal(replayConfirm.authenticate.authenticationError, 'MFA_SECOND_FACTOR_INVALID');
    console.log('5. confirm-time code replay rejected');

    // 6. A fresh code at the next step logs in.
    if (currentStep() <= confirmedStep) {
        await sleepUntilNextStep();
    }
    const freshCode = codeFor(currentStep());
    const withFactor = await gql(
        `mutation { authenticate(input: { native: { username: "${USERNAME}", password: "${PASSWORD}", secondFactorCode: "${freshCode}" } }) {
            ... on CurrentUser { id }
            ... on InvalidCredentialsError { authenticationError }
        } }`,
    );
    assert.ok(withFactor.authenticate.id, 'fresh TOTP code must log in');
    console.log('6. fresh TOTP code login OK');

    // 7. The same code cannot be used twice (single use).
    authToken = undefined;
    const replayLogin = await gql(
        `mutation { authenticate(input: { native: { username: "${USERNAME}", password: "${PASSWORD}", secondFactorCode: "${freshCode}" } }) {
            ... on CurrentUser { id }
            ... on InvalidCredentialsError { authenticationError }
        } }`,
    );
    assert.equal(replayLogin.authenticate.authenticationError, 'MFA_SECOND_FACTOR_INVALID');
    console.log('7. TOTP code replay rejected (single use)');

    // 8. A backup code logs in; consuming it a second time fails.
    const backupCode = state.backupCodes[0];
    const withBackup = await gql(
        `mutation { authenticate(input: { native: { username: "${USERNAME}", password: "${PASSWORD}", secondFactorCode: "${backupCode}" } }) {
            ... on CurrentUser { id }
            ... on InvalidCredentialsError { authenticationError }
        } }`,
    );
    assert.ok(withBackup.authenticate.id, 'backup code must log in');
    authToken = undefined;
    const backupReplay = await gql(
        `mutation { authenticate(input: { native: { username: "${USERNAME}", password: "${PASSWORD}", secondFactorCode: "${backupCode}" } }) {
            ... on CurrentUser { id }
            ... on InvalidCredentialsError { authenticationError }
        } }`,
    );
    assert.equal(backupReplay.authenticate.authenticationError, 'MFA_SECOND_FACTOR_INVALID');
    console.log('8. backup code login OK, replay rejected (single use)');

    // 9. Status reflects the remaining codes (re-login first: the replay
    //    check above discarded the session on purpose).
    await sleepUntilNextStep();
    const statusLoginCode = codeFor(currentStep());
    const statusLogin = await gql(
        `mutation { authenticate(input: { native: { username: "${USERNAME}", password: "${PASSWORD}", secondFactorCode: "${statusLoginCode}" } }) {
            ... on CurrentUser { id }
            ... on InvalidCredentialsError { authenticationError }
        } }`,
    );
    assert.ok(statusLogin.authenticate.id, 'login with a fresh code must succeed before status check');
    const status = await gql(`query { mfaStatus { totpEnrolled backupCodesRemaining enforcementRequiresWebAuthn } }`);
    assert.equal(status.mfaStatus.totpEnrolled, true);
    assert.equal(status.mfaStatus.backupCodesRemaining, 9);
    assert.equal(status.mfaStatus.enforcementRequiresWebAuthn, false);
    console.log('9. status OK: 9 backup codes remaining, enforcement off');

    // 10. The audit trail recorded the ceremony.
    const audit = await gql(
        `query { auditLogEntries(options: { take: 100, sort: { createdAt: DESC } }) { items { action actorIdentifier } } }`,
    );
    const actions = audit.auditLogEntries.items.map(item => item.action);
    for (const expected of [
        'mfa.totp.enroll_started',
        'mfa.totp.confirmed',
        'auth.login.second_factor_required',
        'mfa.totp.verified',
        'mfa.backup_code.used',
        'mfa.backup_code.rejected',
    ]) {
        assert.ok(actions.includes(expected), `audit trail must contain ${expected}`);
    }
    console.log('10. audit trail contains the full ceremony');

    // 11. Cleanup: disable TOTP again so the superadmin returns to plain
    //     password login (backup codes are pruned with the last factor).
    const disabled = await gql(`mutation { disableTotp(password: "${PASSWORD}") { totpEnrolled backupCodesRemaining } }`);
    assert.equal(disabled.disableTotp.totpEnrolled, false);
    assert.equal(disabled.disableTotp.backupCodesRemaining, 0);
    authToken = undefined;
    const plainAgain = await gql(
        `mutation { authenticate(input: { native: { username: "${USERNAME}", password: "${PASSWORD}" } }) {
            ... on CurrentUser { id }
            ... on InvalidCredentialsError { errorCode }
        } }`,
    );
    assert.ok(plainAgain.authenticate.id, 'plain login must work again after disabling TOTP');
    console.log('11. cleanup OK: TOTP disabled, plain login restored');

    console.log('\nTOTP live E2E: ALL CHECKS PASSED');
    process.exit(0);
}

main().catch(err => {
    console.error('TOTP live E2E FAILED:', err.message);
    process.exit(1);
});
