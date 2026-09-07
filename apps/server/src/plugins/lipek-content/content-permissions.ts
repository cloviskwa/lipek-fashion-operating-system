import { CrudPermissionDefinition } from '@vendure/core';

/**
 * A single CRUD permission covering every editorial entity in this plugin.
 *
 * One permission rather than ten: the SOT treats content authoring as one
 * staff capability, and a content editor who may write FAQs may also write
 * articles. Splitting it per entity would create ten near-identical roles
 * with no real access boundary between them.
 *
 * Yields `CreateContent`, `ReadContent`, `UpdateContent` and `DeleteContent`,
 * assignable to roles in the Dashboard.
 */
export const contentPermission = new CrudPermissionDefinition(
    'Content',
    operation => `Grants permission to ${operation} LIPEK editorial content`,
);
