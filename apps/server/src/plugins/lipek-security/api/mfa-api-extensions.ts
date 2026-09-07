import gql from 'graphql-tag';

import { adminApiExtensions as auditAdminApiExtensions } from './admin-api-extensions';

/**
 * GraphQL extensions for the MFA ceremonies (`R-04`, `ADR-0006`/`SEC-002`–`SEC-004`).
 *
 * Shared by the Admin API (staff) and the Shop API (customers); the Admin
 * schema additionally carries `createMfaRecoveryCode` for the support flow,
 * and folds in the audit-trail schema so the plugin exposes one combined
 * admin extension document.
 *
 * Self-service operations are always scoped server-side to the
 * `RequestContext`'s own user — ownership is the authorization, so the
 * surface is deliberately identical for customers and staff.
 */
const sharedExtensions = gql`
    type MfaStatus {
        totpEnrolled: Boolean!
        backupCodesRemaining: Int!
        webAuthnCredentials: [WebAuthnCredentialSummary!]!
        """True when this account may only complete login with a passkey."""
        enforcementRequiresWebAuthn: Boolean!
    }

    type WebAuthnCredentialSummary {
        id: ID!
        nickname: String!
        deviceType: String!
        backedUp: Boolean!
        createdAt: DateTime!
    }

    type TotpEnrollmentStart {
        secret: String!
        otpauthUri: String!
    }

    type TotpEnrollmentConfirmation {
        status: MfaStatus!
        backupCodes: [String!]!
    }

    type WebAuthnOptionsStart {
        publicKeyOptions: JSON!
        correlationKey: String!
    }

    type MfaRecoveryCodeIssued {
        code: String!
        expiresAt: DateTime!
    }

    extend type Query {
        """MFA state for the signed-in user."""
        mfaStatus: MfaStatus!
        """
        Begin an anonymous passkey login ceremony. Returns discovery options
        (no user information) plus the correlation key to echo back inside
        the webAuthn input of the authenticate mutation.
        """
        requestWebAuthnAuthenticationChallenge: WebAuthnOptionsStart!
    }

    extend type Mutation {
        startTotpEnrollment: TotpEnrollmentStart!
        """Activates the pending TOTP enrollment; issues the backup codes once."""
        confirmTotpEnrollment(code: String!): TotpEnrollmentConfirmation!
        """Replaces the standing backup codes; requires password re-entry."""
        regenerateBackupCodes(password: String!): [String!]!
        disableTotp(password: String!): MfaStatus!
        requestWebAuthnRegistrationOptions: WebAuthnOptionsStart!
        "'registration' is the JSON-serialized RegistrationResponseJSON from @simplewebauthn/browser."
        verifyWebAuthnRegistration(correlationKey: String!, registration: String!, nickname: String!): MfaStatus!
        removeWebAuthnCredential(id: ID!, password: String!): MfaStatus!
        """
        Re-enrollment ceremony for a locked-out user: password plus a
        support-issued recovery code authorize registering a *new* passkey.
        Never creates a session. The recovery code is consumed on success.
        """
        requestMfaRecoveryRegistrationOptions(identifier: String!, password: String!, recoveryCode: String!): WebAuthnOptionsStart!
        verifyMfaRecoveryRegistration(
            identifier: String!
            password: String!
            correlationKey: String!
            "'registration' is the JSON-serialized RegistrationResponseJSON from @simplewebauthn/browser."
            registration: String!
            nickname: String!
            recoveryCode: String!
        ): Boolean!
    }
`;

export const adminApiExtensions = gql`
    ${auditAdminApiExtensions}
    ${sharedExtensions}

    extend type Mutation {
        """
        Issue an expiring MFA recovery code for a locked-out user. Requires
        the ManageMfaRecovery permission; the plaintext code is shown once.
        """
        createMfaRecoveryCode(userId: ID!, validityMinutes: Int): MfaRecoveryCodeIssued!
    }
`;

export const shopApiExtensions = gql`
    ${sharedExtensions}
`;
