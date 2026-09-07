/**
 * Shared result types for the MFA ceremonies (`R-04`). Services speak in
 * these plain unions rather than throwing, so the GraphQL layer can decide
 * how each outcome maps onto schema types and error shapes.
 */

/** Returned by `startTotpEnrollment` — shown once, as a QR code. */
export interface MfaEnrollmentStart {
    secret: string;
    otpauthUri: string;
}

export type TotpVerificationResult = { ok: true } | { ok: false; reason: 'NOT_ENROLLED' | 'INVALID_CODE' };

/** The MFA state a login decision (and the status screens) need. */
export interface MfaProfile {
    /** An activated TOTP credential exists. */
    totpEnrolled: boolean;
    webAuthnCredentialCount: number;
    backupCodesRemaining: number;
}

/** Enforcement decision for one user at one login attempt. */
export interface MfaEnforcementDecision {
    /** `LIPEK_MFA_ENFORCEMENT=privileged` and the user holds a privileged role. */
    webAuthnRequired: boolean;
}

/** Result of `startWebAuthnRegistration` / challenge-issuing calls. */
export interface WebAuthnChallengeStart {
    /** Serialized `PublicKeyCredentialCreationOptionsJSON` / `...RequestOptionsJSON`. */
    publicKeyOptions: unknown;
    /** Opaque key tying the browser's response back to the stored challenge. */
    correlationKey: string;
}
