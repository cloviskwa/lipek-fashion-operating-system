import { CustomFields } from '@vendure/core';

/**
 * Custom field definitions for Vendure's own entities.
 *
 * These columns already exist in the LIPEK database -- they were created by
 * the `ProductCatalogCustomFields`, `SeoFields` and `Phase4CommerceOperations`
 * migrations (27-28 August 2026) whose source was lost with the unpushed
 * commits. This file restores the *declarations* so that Vendure's entity
 * metadata matches the live schema again; it deliberately adds no new column.
 *
 * See `docs/implementation/BACKEND_REBUILD_PLAN.md` (task R-01) for how this
 * was reconstructed and what the remaining rebuild involves.
 *
 * Two rules when editing this file:
 *
 *   1. Every field here maps to a column that already exists. Adding a field
 *      that does not is a schema change and needs a migration -- see
 *      `docs/implementation/migrations.md`.
 *   2. `localeString`/`localeText` fields live on the entity's *translation*
 *      table, plain `string`/`text` fields on the entity table itself. The
 *      choice is what decides which table the column lands in, so it must
 *      match the surviving schema exactly.
 */
export const customFields: CustomFields = {
    // --- Catalogue & SEO (ProductCatalogCustomFields, SeoFields) ------------
    Product: [
        // Translated: product_translation.customFieldsMetatitle / ...Metadescription
        { name: 'metaTitle', type: 'localeString', nullable: true },
        { name: 'metaDescription', type: 'localeText', nullable: true },
        // Translated care copy shown on the PDP (design spec §13).
        { name: 'careInstructions', type: 'localeText', nullable: true },
        // Untranslated: product.customFields*
        { name: 'ogImageAssetId', type: 'string', nullable: true },
        { name: 'sizeGuideReference', type: 'string', nullable: true },
        // Fit context for the PDP model shot -- "worn by a 6'1\" model, size M".
        { name: 'modelHeight', type: 'string', nullable: true },
        { name: 'modelSizeWorn', type: 'string', nullable: true },
    ],

    Collection: [
        // Translated: collection_translation.customFields*
        { name: 'metaTitle', type: 'localeString', nullable: true },
        { name: 'metaDescription', type: 'localeText', nullable: true },
        // Untranslated: collection.customFieldsOgimageassetid
        { name: 'ogImageAssetId', type: 'string', nullable: true },
    ],

    // --- Commerce operations (Phase4CommerceOperations) ---------------------
    Order: [
        // Deposit-based service orders: tailoring and alterations take a
        // deposit up front and bill the balance on completion.
        { name: 'depositRequired', type: 'boolean', nullable: true },
        { name: 'depositAmount', type: 'int', nullable: true },
        { name: 'balanceDue', type: 'int', nullable: true },
        // Delivery & returns
        { name: 'estimatedDelivery', type: 'datetime', nullable: true },
        { name: 'trackingCarrier', type: 'string', nullable: true },
        { name: 'trackingNumber', type: 'string', nullable: true },
        { name: 'trackingUrl', type: 'string', nullable: true },
        { name: 'returnStatus', type: 'string', nullable: true },
    ],

    Payment: [
        // Which part of a deposit/balance pair this payment settles.
        { name: 'depositComponent', type: 'boolean', nullable: true },
        { name: 'provider', type: 'string', nullable: true },
        { name: 'providerPaymentId', type: 'string', nullable: true },
        // Guards against double-charging on provider webhook replays.
        { name: 'idempotencyKey', type: 'string', nullable: true },
    ],

    Fulfillment: [
        { name: 'carrier', type: 'string', nullable: true },
        { name: 'trackingNumber', type: 'string', nullable: true },
        { name: 'trackingUrl', type: 'string', nullable: true },
        { name: 'estimatedDelivery', type: 'datetime', nullable: true },
    ],

    Refund: [
        { name: 'refundReason', type: 'string', nullable: true },
        // Links a refund back to the ReturnRequest that caused it. Stored as a
        // plain id, not a relation, because ReturnRequest is part of the
        // not-yet-rebuilt commerce-operations plugin (rebuild task R-07).
        { name: 'returnRequestId', type: 'string', nullable: true },
    ],
};
