import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the tables backing `LipekContentPlugin`'s navigation entities and
 * `CustomerExperiencePlugin`'s wishlist.
 *
 * The navigation tables already exist in the long-lived LIPEK database --
 * they predate the plugin source in this repository -- so every navigation
 * statement here is guarded and is a no-op there, while still producing the
 * correct schema on a fresh database. The entities were written to match
 * those existing columns exactly, so both paths converge on one shape.
 *
 * Constraint and index names are TypeORM's own generated names rather than
 * readable ones. That is deliberate: TypeORM compares the live schema
 * against entity metadata by these names, and hand-chosen names make the
 * server report a schema mismatch on every boot.
 */
export class NavigationAndWishlist1788728508566 implements MigrationInterface {
    name = 'NavigationAndWishlist1788728508566';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // --- LipekContentPlugin: navigation ---------------------------------
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "navigation_menu" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "identifier" character varying NOT NULL,
                "name" character varying NOT NULL,
                "enabled" boolean NOT NULL DEFAULT true,
                "id" SERIAL NOT NULL,
                CONSTRAINT "PK_f98b5b1f95020a89b26b10baef1" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "IDX_afc15bdb78bc5c383ddac5684a"
                ON "navigation_menu" ("identifier")
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "navigation_item" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "label" character varying NOT NULL,
                "url" character varying,
                "position" integer NOT NULL DEFAULT 0,
                "enabled" boolean NOT NULL DEFAULT true,
                "id" SERIAL NOT NULL,
                "menuId" integer NOT NULL,
                "parentId" integer,
                "collectionId" integer,
                "pageId" integer,
                CONSTRAINT "PK_f1ab5d46bde4308ca87f4c60378" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_f01023d44d4b377bc8b0abfe0b"
                ON "navigation_item" ("menuId")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_4f4d31fc778461c8e93c96ce1d"
                ON "navigation_item" ("parentId")
        `);

        // The pre-existing navigation tables carry no foreign keys. The
        // entities declare the relations, so add them where missing --
        // guarded, because Postgres has no ADD CONSTRAINT IF NOT EXISTS.
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_f01023d44d4b377bc8b0abfe0bb'
                ) THEN
                    ALTER TABLE "navigation_item"
                        ADD CONSTRAINT "FK_f01023d44d4b377bc8b0abfe0bb"
                        FOREIGN KEY ("menuId") REFERENCES "navigation_menu"("id")
                        ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_4f4d31fc778461c8e93c96ce1d7'
                ) THEN
                    ALTER TABLE "navigation_item"
                        ADD CONSTRAINT "FK_4f4d31fc778461c8e93c96ce1d7"
                        FOREIGN KEY ("parentId") REFERENCES "navigation_item"("id")
                        ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);

        // --- CustomerExperiencePlugin: wishlist -----------------------------
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "wishlist_item" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "id" SERIAL NOT NULL,
                "customerId" integer NOT NULL,
                "productVariantId" integer NOT NULL,
                CONSTRAINT "PK_wishlist_item_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_wishlist_item_customer_variant" UNIQUE ("customerId", "productVariantId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_23cb8f58212ad0af752dd3e67e"
                ON "wishlist_item" ("customerId")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_acb085dfe252134ae370f57fd4"
                ON "wishlist_item" ("productVariantId")
        `);
        await queryRunner.query(`
            ALTER TABLE "wishlist_item"
                ADD CONSTRAINT "FK_23cb8f58212ad0af752dd3e67e7"
                FOREIGN KEY ("customerId") REFERENCES "customer"("id")
                ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "wishlist_item"
                ADD CONSTRAINT "FK_acb085dfe252134ae370f57fd4d"
                FOREIGN KEY ("productVariantId") REFERENCES "product_variant"("id")
                ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Only the wishlist is dropped. The navigation tables hold live
        // staff-authored menus in the LIPEK database and are never dropped by
        // a rollback of this migration; the foreign keys added above are
        // removed, returning them to the shape they had before.
        await queryRunner.query(`ALTER TABLE "wishlist_item" DROP CONSTRAINT "FK_acb085dfe252134ae370f57fd4d"`);
        await queryRunner.query(`ALTER TABLE "wishlist_item" DROP CONSTRAINT "FK_23cb8f58212ad0af752dd3e67e7"`);
        await queryRunner.query(`DROP TABLE "wishlist_item"`);
        await queryRunner.query(`ALTER TABLE "navigation_item" DROP CONSTRAINT IF EXISTS "FK_4f4d31fc778461c8e93c96ce1d7"`);
        await queryRunner.query(`ALTER TABLE "navigation_item" DROP CONSTRAINT IF EXISTS "FK_f01023d44d4b377bc8b0abfe0bb"`);
    }
}
