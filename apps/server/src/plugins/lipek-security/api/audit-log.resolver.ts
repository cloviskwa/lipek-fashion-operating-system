import { Args, Query, Resolver } from '@nestjs/graphql';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { Allow, Ctx, ListQueryOptions, RequestContext } from '@vendure/core';

import { AuditLogEntry } from '../entities/audit-log-entry.entity';
import { readAuditLogPermission } from '../security-permissions';
import { AuditLogService } from '../services/audit-log.service';

@Resolver()
export class AuditLogResolver {
    constructor(private auditLogService: AuditLogService) {}

    @Query()
    @Allow(readAuditLogPermission.Permission)
    auditLogEntries(
        @Ctx() ctx: RequestContext,
        @Args() args: { options?: ListQueryOptions<AuditLogEntry> | null },
    ): Promise<PaginatedList<AuditLogEntry>> {
        return this.auditLogService.findAll(ctx, args.options);
    }

    @Query()
    @Allow(readAuditLogPermission.Permission)
    auditLogEntry(@Ctx() ctx: RequestContext, @Args() args: { id: ID }) {
        return this.auditLogService.findOne(ctx, args.id);
    }
}
