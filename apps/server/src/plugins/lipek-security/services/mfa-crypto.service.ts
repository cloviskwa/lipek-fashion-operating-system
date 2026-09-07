import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'crypto';
import { Injectable } from '@nestjs/common';

/**
 * Cryptographic primitives for the MFA ceremonies (`R-04`, `ADR-0006`).
 *
 * Two distinct needs, deliberately separated:
 *
 * 1. **TOTP shared secrets** must be recoverable (verification needs the
 *    original value), so they are encrypted at rest with AES-256-GCM rather
 *    than hashed. The key comes from `LIPEK_MFA_ENCRYPTION_KEY` and is never
 *    persisted or logged.
 * 2. **Backup and recovery codes** are high-entropy, single-use secrets the
 *    user supplies in plaintext. They only need to be *compared*, so a
 *    SHA-256 hash suffices — with 128+ bits of entropy there is nothing for
 *    a dictionary attack to chew on, and a hash means a database leak does
 *    not reveal usable codes.
 *
 * The TOTP envelope embeds an `enrolled` flag alongside the secret so the
 * two-phase enrollment (issue secret → confirm with first code) never leaves
 * a half-activated credential that would demand a code the user never saved.
 */
@Injectable()
export class MfaCryptoService {
    private readonly key: Buffer;

    constructor() {
        const raw = process.env.LIPEK_MFA_ENCRYPTION_KEY;
        if (!raw) {
            // Fail closed at boot: silently running without encryption would
            // store TOTP secrets in plaintext, which is exactly the failure
            // mode this service exists to prevent.
            throw new Error(
                'LIPEK_MFA_ENCRYPTION_KEY is not set — the lipek-security plugin refuses to start without it. ' +
                    'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"',
            );
        }
        const key = /^[0-9a-fA-F]{64}$/.test(raw.trim())
            ? Buffer.from(raw.trim(), 'hex')
            : Buffer.from(raw.trim(), 'base64');
        if (key.length !== 32) {
            throw new Error('LIPEK_MFA_ENCRYPTION_KEY must decode to exactly 32 bytes (AES-256).');
        }
        this.key = key;
    }

    /**
     * Encrypt a TOTP secret (or any small JSON payload) at rest.
     * Format: `v1.gcm:<iv>:<authTag>:<ciphertext>`, all base64url.
     */
    encryptSecret(plaintext: string): string {
        const iv = randomBytes(12);
        const cipher = createCipheriv('aes-256-gcm', this.key, iv);
        const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();
        return ['v1.gcm', iv.toString('base64url'), tag.toString('base64url'), ciphertext.toString('base64url')].join(':');
    }

    /** Decrypt an envelope produced by {@link encryptSecret}. Throws on tamper. */
    decryptSecret(envelope: string): string {
        const [version, ivPart, tagPart, ctPart] = envelope.split(':');
        if (version !== 'v1.gcm' || !ivPart || !tagPart || !ctPart) {
            throw new Error('Unrecognised MFA secret envelope');
        }
        const decipher = createDecipheriv('aes-256-gcm', this.key, Buffer.from(ivPart, 'base64url'));
        decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
        return Buffer.concat([decipher.update(Buffer.from(ctPart, 'base64url')), decipher.final()]).toString('utf8');
    }

    /** Hash a backup/recovery code for storage. Normalisation first, then SHA-256. */
    hashCode(code: string): string {
        return createHash('sha256').update(normalizeCode(code), 'utf8').digest('hex');
    }

    /** Constant-time comparison of a supplied code against a stored hash. */
    verifyCodeHash(code: string, storedHash: string): boolean {
        const supplied = Buffer.from(this.hashCode(code), 'hex');
        const stored = Buffer.from(storedHash, 'hex');
        if (supplied.length !== stored.length) {
            return false;
        }
        return timingSafeEqual(supplied, stored);
    }

    /**
     * Generate a human-readable backup code: 4×4 characters from an
     * unambiguous alphabet, dash-separated (`K7M2-4QX9-P3ND-8TVW`). Also
     * *this* code's hash is what gets stored; the plaintext is returned once.
     */
    generateBackupCode(): string {
        const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0, 1
        const chars = Array.from(randomBytes(16))
            .map(byte => alphabet[byte % alphabet.length])
            .join('');
        return (chars.match(/.{4}/g) as string[]).join('-');
    }

    /**
     * Generate a support-issued recovery code. Longer than a backup code
     * because it may be read out over a channel; the expiry is the control
     * that bounds its exposure, not its length alone.
     */
    generateRecoveryCode(): string {
        return randomBytes(24).toString('base64url');
    }

    /** Opaque correlation key for WebAuthn challenge rows. */
    generateCorrelationKey(): string {
        return randomBytes(18).toString('base64url');
    }

    /** A fresh WebAuthn challenge (base64url, 32 bytes). */
    generateChallenge(): string {
        return randomBytes(32).toString('base64url');
    }
}

function normalizeCode(code: string): string {
    // Case- and separator-insensitive comparison: users will transcribe
    // codes with lowercase letters and without dashes.
    return code.replace(/[\s-]/g, '').toUpperCase();
}
