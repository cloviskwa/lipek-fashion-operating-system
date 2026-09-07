import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const pluginRoot = path.join(import.meta.dirname, '..', '..', 'src', 'plugins', 'lipek-security');

/**
 * The enforcement decision (`ADR-0006` decision 4) is pure logic over the
 * user's roles and the configured mode, so it is pinned here independently
 * of any database: `off` never gates, `privileged` gates exactly the roles
 * configured as privileged — with WebAuthn *specifically*, not just any
 * factor.
 */
async function transpile(relPath) {
    const source = await readFile(path.join(pluginRoot, relPath), 'utf8');
    const stripped = source
        .replace(/^\s*@Injectable\(\)\s*$/gm, '')
        // dotenv's side-effect import cannot resolve from a data: URL.
        .replace(/^\s*import\s+'dotenv\/config';?\s*$/gm, '');
    const { outputText } = ts.transpileModule(stripped, {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    });
    return outputText;
}

let loadCount = 0;

async function loadMfaService() {
    // mfa.service.ts imports mfa-config.ts (and other modules); concatenate
    // the config ahead of it so the single data: URL module is self-contained.
    const config = (await transpile('mfa-config.ts')).replace(
        /import\s*\{[\s\S]*?\}\s*from\s*['"]\.\/services\/[^'"]*['"];?/g,
        '',
    );
    const service = (await transpile(path.join('services', 'mfa.service.ts')))
        .replace(/import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]*['"];?/g, '');
    // Cache-buster: identical data: URLs are evaluated only once per process,
    // which would freeze the config at the first test's environment.
    const joined = `${config}\n// load#${++loadCount}\n${service}`;
    return import(
        `data:text/javascript;base64,${Buffer.from(joined).toString('base64')}`
    );
}

function userWithRoles(...codes) {
    return { id: '1', identifier: 'staff@lipek.test', roles: codes.map(code => ({ code })) };
}

test('enforcement mode `off` never requires WebAuthn, even for super-admin', async () => {
    process.env.LIPEK_MFA_ENFORCEMENT = 'off';
    process.env.LIPEK_PRIVILEGED_ROLES = 'super-admin';
    const { MfaService, mfaConfig } = await loadMfaService();
    const svc = new MfaService(null, null, null, null, null, null, null);
    assert.equal(mfaConfig.enforcementMode, 'off');
    assert.equal(svc.evaluateEnforcement(userWithRoles('super-admin')).webAuthnRequired, false);
});

test('enforcement mode `privileged` requires WebAuthn specifically for privileged roles', async () => {
    process.env.LIPEK_MFA_ENFORCEMENT = 'privileged';
    process.env.LIPEK_PRIVILEGED_ROLES = 'super-admin';
    const { MfaService } = await loadMfaService();
    const svc = new MfaService(null, null, null, null, null, null, null);
    assert.equal(svc.evaluateEnforcement(userWithRoles('super-admin')).webAuthnRequired, true);
    assert.equal(svc.evaluateEnforcement(userWithRoles('store-manager')).webAuthnRequired, false);
    assert.equal(svc.evaluateEnforcement(userWithRoles('store-manager', 'super-admin')).webAuthnRequired, true);
});

test('the privileged role list is configurable', async () => {
    process.env.LIPEK_MFA_ENFORCEMENT = 'privileged';
    process.env.LIPEK_PRIVILEGED_ROLES = 'super-admin, finance';
    const { MfaService } = await loadMfaService();
    const svc = new MfaService(null, null, null, null, null, null, null);
    assert.equal(svc.evaluateEnforcement(userWithRoles('finance')).webAuthnRequired, true);
    assert.equal(svc.evaluateEnforcement(userWithRoles('super-admin')).webAuthnRequired, true);
    assert.equal(svc.evaluateEnforcement(userWithRoles('marketing')).webAuthnRequired, false);
});

test('an unknown enforcement mode falls back to `off` rather than gating silently', async () => {
    process.env.LIPEK_MFA_ENFORCEMENT = 'sometimes';
    process.env.LIPEK_PRIVILEGED_ROLES = 'super-admin';
    const { mfaConfig } = await loadMfaService();
    assert.equal(mfaConfig.enforcementMode, 'off');
});
