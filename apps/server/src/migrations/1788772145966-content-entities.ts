import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Rebuild task R-02 — tables backing `LipekContentPlugin`'s editorial entities.
 *
 * All ten tables already exist in the LIPEK database (created 27–28 August
 * 2026 by the lost `LipekContentEntities`, `PageSectionScheduledAt` and
 * `SeoFields` migrations), so every statement here is guarded and is a no-op
 * there while still producing the correct schema on a fresh database.
 *
 * Index, primary-key and foreign-key names are TypeORM's own generated names
 * taken from the live schema, not readable ones — see
 * `docs/implementation/BACKEND_REBUILD_PLAN.md` §4 rule 2.
 */
export class ContentEntities1788772145966 implements MigrationInterface {
    name = 'ContentEntities1788772145966';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "article_category" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying NOT NULL,
                "slug" character varying NOT NULL,
                "id" SERIAL NOT NULL,
                CONSTRAINT "PK_cdd234ef147c8552a8abd42bd29" PRIMARY KEY ("id")
            )`);
        await queryRunner.query(
            `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_a56a08e0683b224ecb310a7044" ON "article_category" ("slug")`,
        );

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "article" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "title" character varying NOT NULL,
                "slug" character varying NOT NULL,
                "excerpt" text NOT NULL DEFAULT '',
                "body" text NOT NULL DEFAULT '',
                "status" character varying NOT NULL DEFAULT 'DRAFT',
                "publishedAt" TIMESTAMP,
                "id" SERIAL NOT NULL,
                "articleCategoryId" integer,
                "featuredAssetId" integer,
                "metaTitle" character varying,
                "metaDescription" text,
                "ogImageAssetId" integer,
                CONSTRAINT "PK_40808690eb7b915046558c0f81b" PRIMARY KEY ("id")
            )`);
        await queryRunner.query(
            `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_0ab85f4be07b22d79906671d72" ON "article" ("slug")`,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_357fa08ef2c105399118e54e68" ON "article" ("articleCategoryId")`,
        );

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "content_page" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "title" character varying NOT NULL,
                "slug" character varying NOT NULL,
                "body" text NOT NULL DEFAULT '',
                "status" character varying NOT NULL DEFAULT 'DRAFT',
                "scheduledAt" TIMESTAMP,
                "publishedAt" TIMESTAMP,
                "id" SERIAL NOT NULL,
                "metaTitle" character varying,
                "metaDescription" text,
                "ogImageAssetId" integer,
                CONSTRAINT "PK_ccd32b01633fadce3530aba203e" PRIMARY KEY ("id")
            )`);
        await queryRunner.query(
            `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_ef5c4f25fa4f48ec2d6c8365e1" ON "content_page" ("slug")`,
        );

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "page_section" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "sectionType" character varying NOT NULL,
                "position" integer NOT NULL DEFAULT 0,
                "config" text,
                "status" character varying NOT NULL DEFAULT 'DRAFT',
                "id" SERIAL NOT NULL,
                "pageId" integer NOT NULL,
                "scheduledAt" TIMESTAMP,
                CONSTRAINT "PK_24ff5b425f241e57ace24536df9" PRIMARY KEY ("id")
            )`);
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_1671cbfcff04cf9ade49734f56" ON "page_section" ("pageId")`,
        );

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "banner" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "title" character varying NOT NULL,
                "message" text NOT NULL DEFAULT '',
                "ctaLabel" character varying,
                "ctaUrl" character varying,
                "status" character varying NOT NULL DEFAULT 'DRAFT',
                "scheduledAt" TIMESTAMP,
                "expiresAt" TIMESTAMP,
                "id" SERIAL NOT NULL,
                "imageAssetId" integer,
                CONSTRAINT "PK_6d9e2570b3d85ba37b681cd4256" PRIMARY KEY ("id")
            )`);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "faq_item" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "question" text NOT NULL,
                "answer" text NOT NULL,
                "category" character varying,
                "position" integer NOT NULL DEFAULT 0,
                "status" character varying NOT NULL DEFAULT 'DRAFT',
                "id" SERIAL NOT NULL,
                CONSTRAINT "PK_ce6ab657867e488a12af6cc1c9b" PRIMARY KEY ("id")
            )`);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "policy_document" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "title" character varying NOT NULL,
                "slug" character varying NOT NULL,
                "body" text NOT NULL DEFAULT '',
                "status" character varying NOT NULL DEFAULT 'DRAFT',
                "id" SERIAL NOT NULL,
                "metaTitle" character varying,
                "metaDescription" text,
                "ogImageAssetId" integer,
                CONSTRAINT "PK_bcf61e29dc9154db3e3d0d7ba6f" PRIMARY KEY ("id")
            )`);
        await queryRunner.query(
            `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_a7486329a43636022b2a868ed6" ON "policy_document" ("slug")`,
        );

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "service_definition" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying NOT NULL,
                "slug" character varying NOT NULL,
                "description" text NOT NULL DEFAULT '',
                "priceFrom" integer,
                "category" character varying NOT NULL,
                "status" character varying NOT NULL DEFAULT 'DRAFT',
                "id" SERIAL NOT NULL,
                "metaTitle" character varying,
                "metaDescription" text,
                "ogImageAssetId" integer,
                CONSTRAINT "PK_e5dfde8f75ee185573d737b3e05" PRIMARY KEY ("id")
            )`);
        await queryRunner.query(
            `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_8bfb0bc62fc9b3408022ce4198" ON "service_definition" ("slug")`,
        );

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "store_location" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying NOT NULL,
                "addressLine1" character varying NOT NULL,
                "addressLine2" character varying,
                "city" character varying NOT NULL,
                "region" character varying,
                "postalCode" character varying,
                "country" character varying NOT NULL,
                "phone" character varying,
                "email" character varying,
                "openingHours" text,
                "status" character varying NOT NULL DEFAULT 'PUBLISHED',
                "id" SERIAL NOT NULL,
                CONSTRAINT "PK_109d2fd491fde750eaffb318524" PRIMARY KEY ("id")
            )`);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "testimonial" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "authorName" character varying NOT NULL,
                "quote" text NOT NULL,
                "rating" integer,
                "status" character varying NOT NULL DEFAULT 'DRAFT',
                "id" SERIAL NOT NULL,
                CONSTRAINT "PK_e1aee1c726db2d336480c69f7cb" PRIMARY KEY ("id")
            )`);

        // The surviving tables carry no foreign keys; the entities declare the
        // relations, so add them where missing. Postgres has no
        // ADD CONSTRAINT IF NOT EXISTS, hence the guarded block.
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_357fa08ef2c105399118e54e681') THEN
                    ALTER TABLE "article" ADD CONSTRAINT "FK_357fa08ef2c105399118e54e681"
                        FOREIGN KEY ("articleCategoryId") REFERENCES "article_category"("id")
                        ON DELETE SET NULL ON UPDATE NO ACTION;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_1671cbfcff04cf9ade49734f569') THEN
                    ALTER TABLE "page_section" ADD CONSTRAINT "FK_1671cbfcff04cf9ade49734f569"
                        FOREIGN KEY ("pageId") REFERENCES "content_page"("id")
                        ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
            END $$;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // These tables hold live staff-authored content in the LIPEK database
        // and are never dropped by a rollback of this migration; only the
        // constraints it added are removed.
        await queryRunner.query(
            `ALTER TABLE "page_section" DROP CONSTRAINT IF EXISTS "FK_1671cbfcff04cf9ade49734f569"`,
        );
        await queryRunner.query(
            `ALTER TABLE "article" DROP CONSTRAINT IF EXISTS "FK_357fa08ef2c105399118e54e681"`,
        );
    }
}
