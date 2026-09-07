import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const pluginRoot = path.join(import.meta.dirname, '..', '..', 'src', 'plugins', 'lipek-security');

/**
 * The crypto service is pure Node crypto with no DI dependencies, so it is
 * transpiled and exercised directly — same approach as the service-workflow
 * stage-machine tests. These properties are the security floor for every MFA
 * ceremony and are worth pinning independently of any database.
 */
async function transpile(file) {
    const source = await readFile(path.join(pluginRoot, 'services', file), 'utf8');
    // Decorators reference a NestJS import that does not exist in the
    // data:-URL module; the class is instantiated with plain `new` here.
    const stripped = source.replace(/^\s*@Injectable\(\)\s*$/gm, '');
    const { outputText } = ts.transpileModule(stripped, {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    });
    return outputText;
}

const KEY_B64 = Buffer.alloc(32, 7).toString('base64');

async function loadService(env) {
    process.env.LIPEK_MFA_ENCRYPTION_KEY = env;
    return import(
        `data:text/javascript;base64,${Buffer.from(await transpile('mfa-crypto.service.ts')).toString('base64')}`
    );
}

test('a missing encryption key refuses to construct (fail closed at boot)', async () => {
    const { MfaCryptoService } = await loadService('');
    assert.throws(() => new MfaCryptoService(), /LIPEK_MFA_ENCRYPTION_KEY is not set/);
});

test('a wrongly-sized key is rejected', async () => {
    const { MfaCryptoService } = await loadService(Buffer.alloc(16, 7).toString('base64'));
    assert.throws(() => new MfaCryptoService(), /exactly 32 bytes/);
});

test('hex and base64 keys are both accepted', async () => {
    const { MfaCryptoService } = await loadService(Buffer.alloc(32, 9).toString('hex'));
    const svc = new MfaCryptoService();
    const envelope = svc.encryptSecret('hello');
    assert.equal(svc.decryptSecret(envelope), 'hello');
});

test('secret encryption round-trips and tampering is detected', async () => {
    const { MfaCryptoService } = await loadService(KEY_B64);
    const svc = new MfaCryptoService();
    const secret = JSON.stringify({ v: 1, secret: 'JBSWY3DPEHPK3PXP', enrolled: false });
    const envelope = svc.encryptSecret(secret);
    assert.match(envelope, /^v1\.gcm:/);
    assert.equal(svc.decryptSecret(envelope), secret);

    const parts = envelope.split(':');
    const tampered = ['v1.gcm', parts[1], parts[2], Buffer.from('evil').toString('base64url')].join(':');
    assert.throws(() => svc.decryptSecret(tampered));

    const flippedIv = ['v1.gcm', Buffer.from(Date.now().toString()).toString('base64url'), parts[2], parts[3]].join(':');
    assert.throws(() => svc.decryptSecret(flippedIv));
});

test('each encryption uses a fresh IV, so equal plaintexts differ in storage', async () => {
    const { MfaCryptoService } = await loadService(KEY_B64);
    const svc = new MfaCryptoService();
    assert.notEqual(svc.encryptSecret('same'), svc.encryptSecret('same'));
});

test('code hashing is case- and separator-insensitive on verify', async () => {
    const { MfaCryptoService } = await loadService(KEY_B64);
    const svc = new MfaCryptoService();
    const code = svc.generateBackupCode();
    assert.match(code, /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
    const hash = svc.hashCode(code);
    assert.equal(hash, svc.hashCode(code.toLowerCase().replace(/-/g, '')));
    assert.ok(svc.verifyCodeHash(code.toLowerCase().replaceAll('-', ''), hash));
    assert.ok(svc.verifyCodeHash(code, hash));
    // A deterministically different code must not verify: swap the first
    // character for one that differs from it.
    const first = code[0];
    const different = first === 'A' ? 'B' : 'A';
    assert.equal(svc.verifyCodeHash(different + code.slice(1), hash), false);
});

test('wrong codes and hashes never verify, regardless of length', async () => {
    const { MfaCryptoService } = await loadService(KEY_B64);
    const svc = new MfaCryptoService();
    const hash = svc.hashCode(svc.generateBackupCode());
    assert.equal(svc.verifyCodeHash('nope', hash), false);
    assert.equal(svc.verifyCodeHash('x'.repeat(19), hash), false);
});

test('recovery codes are long, URL-safe, and independently verifiable', async () => {
    const { MfaCryptoService } = await loadService(KEY_B64);
    const svc = new MfaCryptoService();
    const code = svc.generateRecoveryCode();
    assert.match(code, /^[A-Za-z0-9_-]{32}$/);
    assert.ok(svc.verifyCodeHash(code, svc.hashCode(code)));
});

test('correlation keys and challenges are unguessable and non-repeating', async () => {
    const { MfaCryptoService } = await loadService(KEY_B64);
    const svc = new MfaCryptoService();
    assert.notEqual(svc.generateCorrelationKey(), svc.generateCorrelationKey());
    assert.notEqual(svc.generateChallenge(), svc.generateChallenge());
    assert.equal(Buffer.from(svc.generateChallenge(), 'base64url').length, 32);
});
