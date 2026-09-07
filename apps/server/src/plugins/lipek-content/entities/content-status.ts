/**
 * Publication state shared by every editorial entity in this plugin.
 *
 * Recovered from the surviving rows: the `status` column on all ten content
 * tables holds exactly `DRAFT` or `PUBLISHED`. It is stored as a plain
 * `varchar` rather than a Postgres enum, so this union is enforced in the
 * application layer, not the database -- do not add a CHECK constraint
 * without a migration.
 *
 * Storefront-facing queries must return `PUBLISHED` records only. Draft
 * content is visible through the Admin API alone.
 */
export type ContentStatus = 'DRAFT' | 'PUBLISHED';

export const ContentStatus = {
    Draft: 'DRAFT' as const,
    Published: 'PUBLISHED' as const,
};
