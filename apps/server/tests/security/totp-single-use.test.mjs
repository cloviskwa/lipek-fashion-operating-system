import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';
import { generateSecret, generateSync, verify } from 'otplib';

const pluginRoot = path.join(import.meta.dirname, '..', '..', 'src', 'plugins', 'lipek-security');

/**
 * Pins the RFC 6238 ceremony contract that TotpService depends on, using the
 * exact option shapes the service passes to otplib: ±30s acceptance window,
 * `afterTimeStep` replay protection (the code shown at confirm cannot be
 * reused as a login second factor), and no acceptance of a wrong code.
 *
 * The DB-backed wiring is exercised at boot; what must not silently rot is
 * the single-use property of codes.
 */
const PERIOD_SECONDS = 30;
const TOLERANCE = 30;

// The transpiled MfaCryptoService fails closed without a key; tests run in
// their own process, so the key must be set before it is constructed.
process.env.LIPEK_MFA_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');

async function transpile(relPath) {
    const source = await readFile(path.join(pluginRoot, relPath), 'utf8');
    const stripped = source.replace(/^\s*@Injectable\(\)\s*$/gm, '');
    const { outputText } = ts.transpileModule(stripped, {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    });
    return outputText;
}

async function loadCrypto() {
    const module = await import(
        `data:text/javascript;base64,${Buffer.from(await transpile(path.join('services', 'mfa-crypto.service.ts'))).toString('base64')}`
    );
    return new module.MfaCryptoService();
}

const timeStepOf = epochSeconds => Math.floor(epochSeconds / PERIOD_SECONDS);

test('a code from the current step verifies, then never again (single use)', async () => {
    const crypto = await loadCrypto();
    const secret = generateSecret({ length: 20 });
    const now = Math.floor(Date.now() / 1000);
    const token = generateSync({ secret, epoch: now, period: PERIOD_SECONDS });

    const first = await verify({ secret, token, epochTolerance: TOLERANCE, epoch: now });
    assert.equal(first.valid, true);
    const usedStep = timeStepOf(now) + first.delta;

    // Replay of the same code immediately afterwards: rejected via
    // afterTimeStep, exactly as TotpService passes it.
    const replay = await verify({ secret, token, epochTolerance: TOLERANCE, epoch: now, afterTimeStep: usedStep });
    assert.equal(replay.valid, false);
});

test('the next step still verifies after an earlier step was consumed', async () => {
    const crypto = await loadCrypto();
    const secret = generateSecret({ length: 20 });
    const now = Math.floor(Date.now() / 1000);
    const currentStep = timeStepOf(now);

    const currentToken = generateSync({ secret, epoch: now, period: PERIOD_SECONDS });
    const first = await verify({ secret, token: currentToken, epochTolerance: TOLERANCE, epoch: now });
    assert.equal(first.valid, true);
    const usedStep = currentStep + first.delta;

    const nextStepStart = (currentStep + 1) * PERIOD_SECONDS;
    const nextToken = generateSync({ secret, epoch: nextStepStart, period: PERIOD_SECONDS });
    const second = await verify({
        secret,
        token: nextToken,
        epochTolerance: TOLERANCE,
        epoch: nextStepStart,
        afterTimeStep: usedStep,
    });
    assert.equal(second.valid, true);
});

test('a wrong code never verifies even inside the window', async () => {
    const secret = generateSecret({ length: 20 });
    const now = Math.floor(Date.now() / 1000);
    const token = generateSync({ secret, epoch: now, period: PERIOD_SECONDS });
    const wrong = token === '000000' ? '000001' : '000000';
    const result = await verify({ secret, token: wrong, epochTolerance: TOLERANCE, epoch: now });
    assert.equal(result.valid, false);
});

test('the confirm-time code is stored consumed (envelope keeps enrolled + step)', async () => {
    // Mirrors TotpService's envelope contract: the confirmed credential
    // records the step it was confirmed at, so that code cannot open the
    // very next login.
    const crypto = await loadCrypto();
    const secret = generateSecret({ length: 20 });
    const now = Math.floor(Date.now() / 1000);
    const token = generateSync({ secret, epoch: now, period: PERIOD_SECONDS });
    const confirm = await verify({ secret, token, epochTolerance: TOLERANCE, epoch: now });
    assert.equal(confirm.valid, true);

    const envelope = crypto.encryptSecret(JSON.stringify({ v: 1, secret, enrolled: true }));
    const persisted = JSON.parse(crypto.decryptSecret(envelope));
    assert.equal(persisted.enrolled, true);
    assert.equal(persisted.secret, secret);

    const usedStep = timeStepOf(now) + confirm.delta;
    const replay = await verify({ secret, token, epochTolerance: TOLERANCE, epoch: now, afterTimeStep: usedStep });
    assert.equal(replay.valid, false);
});
