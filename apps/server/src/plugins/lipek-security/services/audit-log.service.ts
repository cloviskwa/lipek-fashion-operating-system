import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import {
    ListQueryBuilder,
    ListQueryOptions,
    RequestContext,
    TransactionalConnection,
} from '@vendure/core';

import { AuditLogEntry } from '../entities/audit-log-entry.entity';

export interface RecordAuditInput {
    action: string;
    targetType?: string | null;
    targetId?: ID | null;
    metadata?: Record<string, unknown> | null;
    /**
     * Override the actor when the action has no signed-in user — a failed
     * login knows the attempted identifier but has no session.
     */
    actorIdentifier?: string;
}

/**
 * Append-only security audit trail (`SEC-006`).
 *
 * There is deliberately no update or delete path: an audit log that can be
 * edited is not evidence. Reads are exposed to the Admin API only.
 */
@Injectable()
export class AuditLogService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
    ) {}

    /**
     * Record an action.
     *
     * Never throws: an audit write failing must not roll back or block the
     * operation being audited, since that would turn a logging fault into an
     * outage — and, worse, let an attacker suppress an action by breaking the
     * log. Failures are surfaced on the console and swallowed.
     */
    async record(ctx: RequestContext, input: RecordAuditInput): Promise<void> {
        try {
            // An explicit identifier wins (a failed login knows the attempted
            // username but has no session); otherwise fall back to the signed-in
            // user, and finally to "anonymous".
            const actorIdentifier =
                input.actorIdentifier ??
                (ctx.activeUserId != null ? String(ctx.activeUserId) : 'anonymous');

            const entry = new AuditLogEntry({
                action: input.action,
                actorIdentifier,
                actorUserId: ctx.activeUserId ?? null,
                // Vendure resolves the caller's address through its own
                // trust-proxy configuration, so this is already the client
                // address rather than a load balancer's.
                ipAddress: ctx.req?.ip ?? null,
                targetType: input.targetType ?? null,
                targetId: input.targetId != null ? String(input.targetId) : null,
            });
            // Assigned after construction: `metadata` is free-form, which
            // TypeORM's DeepPartial cannot express.
            entry.metadata = input.metadata ?? null;

            await this.connection.getRepository(ctx, AuditLogEntry).save(entry);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('[LipekSecurityPlugin] failed to write audit log entry', {
                action: input.action,
                error: e instanceof Error ? e.message : String(e),
            });
        }
    }

    async findAll(
        ctx: RequestContext,
        options?: ListQueryOptions<AuditLogEntry> | null,
    ): Promise<PaginatedList<AuditLogEntry>> {
        const [items, totalItems] = await this.listQueryBuilder
            .build(AuditLogEntry, options ?? undefined, {
                ctx,
                // Newest first unless the caller sorts otherwise; an audit log
                // is read from the most recent event backwards.
                orderBy: { createdAt: 'DESC' },
            })
            .getManyAndCount();
        return { items, totalItems };
    }

    async findOne(ctx: RequestContext, id: ID): Promise<AuditLogEntry | undefined> {
        return (
            (await this.connection
                .getRepository(ctx, AuditLogEntry)
                .findOne({ where: { id } })) ?? undefined
        );
    }
}
