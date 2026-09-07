import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Rebuild task R-04 — tables backing `LipekSecurityPlugin`'s credential and
 * audit entities.
 *
 * All six already exist in the LIPEK database (created 26–27 August 2026 by
 * the lost `WebauthnCredentials`, `TotpBackupCodes`, `MfaRecoveryCodes` and
 * `AuditLogEntry` migrations), so every statement is guarded and is a no-op
 * there while producing the correct schema on a fresh database.
 *
 * `audit_log_entry` holds 425 rows written before the loss; nothing here
 * touches existing data.
 *
 * Names are TypeORM's own generated names taken from the live schema — see
 * `docs/implementation/BACKEND_REBUILD_PLAN.md` §4 rule 2.
 */
export class SecurityEntities1788777941843 implements MigrationInterface {
    name = 'SecurityEntities1788777941843';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "totp_credential" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "secretCiphertext" text NOT NULL,
                "lastUsedTimeStep" integer,
                "id" SERIAL NOT NULL,
                "userId" integer NOT NULL,
                CONSTRAINT "PK_6ecb771ad9517a5b9ba9c8473e7" PRIMARY KEY ("id")
            )`);
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_9180faedc035e0ba4514062a30" ON "totp_credential" ("userId")`,
        );

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "web_authn_credential" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "credentialId" character varying NOT NULL,
                "publicKeyBase64" text NOT NULL,
                "counter" integer NOT NULL,
                "deviceType" character varying NOT NULL,
                "backedUp" boolean NOT NULL,
                "transports" text,
                "nickname" character varying NOT NULL,
                "id" SERIAL NOT NULL,
                "userId" integer NOT NULL,
                CONSTRAINT "PK_75836493a407b2d7a4cb926ad97" PRIMARY KEY ("id")
            )`);
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_b0d9884eca4df9e50b3d7bad18" ON "web_authn_credential" ("userId")`,
        );

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "web_authn_challenge" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "subjectKey" character varying NOT NULL,
                "purpose" character varying NOT NULL,
                "challenge" character varying NOT NULL,
                "expiresAt" TIMESTAMP NOT NULL,
                "id" SERIAL NOT NULL,
                CONSTRAINT "PK_9ce45198ad4682648926cc3d191" PRIMARY KEY ("id")
            )`);
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_d8ee5eb753002383065eaeacda" ON "web_authn_challenge" ("subjectKey")`,
        );

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "mfa_recovery_code" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "codeHash" text NOT NULL,
                "expiresAt" TIMESTAMP NOT NULL,
                "id" SERIAL NOT NULL,
                "userId" integer NOT NULL,
                CONSTRAINT "PK_cdbbb187d9498f3aee029649fbf" PRIMARY KEY ("id")
            )`);
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_8b40b5199fd41b290f9441bbc6" ON "mfa_recovery_code" ("userId")`,
        );

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "backup_code" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "codeHash" text NOT NULL,
                "id" SERIAL NOT NULL,
                "userId" integer NOT NULL,
                CONSTRAINT "PK_2499c38512f254ae0511ebb0df4" PRIMARY KEY ("id")
            )`);
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_60b3e821388031ff7038d6e393" ON "backup_code" ("userId")`,
        );

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "audit_log_entry" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "actorIdentifier" character varying NOT NULL,
                "ipAddress" character varying,
                "action" character varying NOT NULL,
                "targetType" character varying,
                "targetId" character varying,
                "metadata" text,
                "id" SERIAL NOT NULL,
                "actorUserId" integer,
                CONSTRAINT "PK_905deda75b16075725a02ef38a0" PRIMARY KEY ("id")
            )`);
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_8b20f4f58bbb53085a12fac181" ON "audit_log_entry" ("action")`,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_ca640ee68b67974f9258dad12f" ON "audit_log_entry" ("actorUserId")`,
        );

        // The surviving tables carry a foreign key only on web_authn_credential;
        // the entities declare the rest, so add them where missing. Names are
        // TypeORM's own, taken from the schema-comparison report on first boot.
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_9180faedc035e0ba4514062a302') THEN
                    ALTER TABLE "totp_credential" ADD CONSTRAINT "FK_9180faedc035e0ba4514062a302"
                        FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_609fa7bda999525a4fa55cd9354') THEN
                    ALTER TABLE "web_authn_credential" ADD CONSTRAINT "FK_609fa7bda999525a4fa55cd9354"
                        FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_8b40b5199fd41b290f9441bbc6e') THEN
                    ALTER TABLE "mfa_recovery_code" ADD CONSTRAINT "FK_8b40b5199fd41b290f9441bbc6e"
                        FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_60b3e821388031ff7038d6e393b') THEN
                    ALTER TABLE "backup_code" ADD CONSTRAINT "FK_60b3e821388031ff7038d6e393b"
                        FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_ca640ee68b67974f9258dad12f7') THEN
                    ALTER TABLE "audit_log_entry" ADD CONSTRAINT "FK_ca640ee68b67974f9258dad12f7"
                        FOREIGN KEY ("actorUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
                END IF;
            END $$;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // `audit_log_entry` is evidence and the credential tables hold live
        // enrolments; a rollback of this migration drops neither. Only a
        // deliberate, separately reviewed migration should ever remove them.
    }
}
