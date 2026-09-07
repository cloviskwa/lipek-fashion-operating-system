import { Injectable } from '@nestjs/common';
import { DeletionResult } from '@vendure/common/lib/generated-types';
import { ID, PaginatedList, Type } from '@vendure/common/lib/shared-types';
import {
    EntityNotFoundError,
    ListQueryBuilder,
    patchEntity,
    ListQueryOptions,
    RequestContext,
    TransactionalConnection,
    UserInputError,
    VendureEntity,
} from '@vendure/core';

import { Repository } from 'typeorm';

import { ContentStatus } from '../entities/content-status';
import { PageSection } from '../entities/page-section.entity';

export interface DeletionResponse {
    result: DeletionResult;
    message?: string;
}

/**
 * Staff-facing writes for every editorial entity in this plugin (rebuild task R-02).
 *
 * Deliberately generic. Ten entities with identical create/update/delete
 * semantics would otherwise mean ten near-identical services; instead the
 * resolver passes the entity class and this handles the rest. Behaviour that
 * genuinely differs per entity — the publish transition, section ordering —
 * is expressed as explicit helpers rather than by forking the CRUD.
 *
 * Unlike `ContentService`, this returns drafts as well as published records:
 * an authoring surface that hid drafts would be useless.
 */
@Injectable()
export class ContentAdminService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
    ) {}

    async findAll<T extends VendureEntity>(
        ctx: RequestContext,
        entity: Type<T>,
        options?: ListQueryOptions<T> | null,
    ): Promise<PaginatedList<T>> {
        // GraphQL sends an explicit null when the argument is omitted, which
        // the query builder cannot destructure.
        const [items, totalItems] = await this.listQueryBuilder
            .build(entity, options ?? undefined, { ctx })
            .getManyAndCount();
        return { items, totalItems };
    }

    async findOne<T extends VendureEntity>(
        ctx: RequestContext,
        entity: Type<T>,
        id: ID,
    ): Promise<T | undefined> {
        return (
            (await this.connection.getRepository(ctx, entity).findOne({ where: { id } as never })) ??
            undefined
        );
    }

    async create<T extends VendureEntity>(
        ctx: RequestContext,
        entity: Type<T>,
        input: Record<string, unknown>,
    ): Promise<T> {
        this.assertValidStatus(input);
        const instance = new entity(this.stampPublishedAt(input, undefined));
        const saved = await this.repositoryFor(ctx, entity).save(instance);
        return saved as T;
    }

    async update<T extends VendureEntity>(
        ctx: RequestContext,
        entity: Type<T>,
        input: Record<string, unknown> & { id: ID },
    ): Promise<T> {
        this.assertValidStatus(input);
        const existing = await this.findOne(ctx, entity, input.id);
        if (!existing) {
            throw new EntityNotFoundError(entity.name as never, input.id);
        }

        const { id, ...changes } = this.stampPublishedAt(
            input,
            existing as unknown as Record<string, unknown>,
        );

        // Patch the loaded instance rather than saving a plain object: TypeORM's
        // update subscribers (including Vendure's custom-field validation) read
        // the entity's class off the saved value, and a bare object has none.
        const patched = patchEntity(existing, changes as never);
        return (await this.repositoryFor(ctx, entity).save(patched)) as T;
    }

    async delete<T extends VendureEntity>(
        ctx: RequestContext,
        entity: Type<T>,
        id: ID,
    ): Promise<DeletionResponse> {
        const existing = await this.findOne(ctx, entity, id);
        if (!existing) {
            return {
                result: DeletionResult.NOT_DELETED,
                message: `No ${entity.name} with id ${String(id)} exists`,
            };
        }
        await this.connection.getRepository(ctx, entity).remove(existing);
        return { result: DeletionResult.DELETED };
    }

    /**
     * A repository widened to `VendureEntity`.
     *
     * TypeORM's `save()` is generic over the concrete entity and cannot prove
     * that a payload assembled from GraphQL input matches `T` — and Vendure's
     * `DeepPartial` is a different type from TypeORM's, so the two do not
     * unify under a generic. The API layer validates the payload before it
     * reaches here, so the widening is contained to this one boundary rather
     * than leaking `any` into the domain.
     */
    private repositoryFor<T extends VendureEntity>(
        ctx: RequestContext,
        entity: Type<T>,
    ): Repository<VendureEntity> {
        return this.connection.getRepository(ctx, entity) as unknown as Repository<VendureEntity>;
    }

    /** A page's sections in render order, drafts included. */
    async findSectionsForPage(ctx: RequestContext, pageId: ID): Promise<PageSection[]> {
        return this.connection.getRepository(ctx, PageSection).find({
            where: { pageId },
            order: { position: 'ASC' },
        });
    }

    /**
     * Reject a status the storefront could never interpret.
     *
     * The column is a plain `varchar`, so nothing at the database level stops
     * a typo like "Published" from being stored and then silently never
     * matching the storefront's PUBLISHED filter.
     */
    private assertValidStatus(input: Record<string, unknown>): void {
        const status = input.status;
        if (status == null) {
            return;
        }
        if (status !== ContentStatus.Draft && status !== ContentStatus.Published) {
            throw new UserInputError(
                `Invalid status "${String(status)}" — expected ${ContentStatus.Draft} or ${ContentStatus.Published}`,
            );
        }
    }

    /**
     * Set `publishedAt` the first time something is published.
     *
     * Only applies to entities that have the column, and never overwrites an
     * existing value — re-publishing after an edit must not rewrite the
     * original publication date, which is what readers and feeds sort on.
     */
    private stampPublishedAt(
        input: Record<string, unknown>,
        existing: Record<string, unknown> | undefined,
    ): Record<string, unknown> {
        const becomingPublished = input.status === ContentStatus.Published;
        if (!becomingPublished) {
            return input;
        }
        const alreadyStamped = input.publishedAt ?? existing?.publishedAt;
        if (alreadyStamped) {
            return input;
        }
        // Entities without the column simply ignore the extra key on save.
        const hasColumn = existing ? 'publishedAt' in existing : true;
        return hasColumn ? { ...input, publishedAt: new Date() } : input;
    }
}
