import { graphql } from '@/gql';

/**
 * Typed document for the security audit-log Dashboard screen (rebuild task
 * `R-04`, `SEC-006`). Read-only by design — `ListPage` needs a query
 * returning `items` + `totalItems`; the append-only log has no detail page,
 * no create and no update. `metadata` is deliberately not fetched: it holds
 * free-form detail that belongs in a deliberate drill-down, not a roster.
 */
export const auditLogListQuery = graphql(`
    query AuditLogList($options: AuditLogEntryListOptions) {
        auditLogEntries(options: $options) {
            items {
                id
                createdAt
                action
                actorIdentifier
                actorUserId
                ipAddress
                targetType
                targetId
            }
            totalItems
        }
    }
`);
