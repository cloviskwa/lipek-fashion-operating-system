import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Collection, CollectionService, Ctx, RequestContext } from '@vendure/core';

import { NavigationItem } from '../entities/navigation-item.entity';
import { NavigationMenu } from '../entities/navigation-menu.entity';
import { NavigationService } from '../services/navigation.service';

@Resolver('NavigationMenu')
export class NavigationMenuResolver {
    constructor(private navigationService: NavigationService) {}

    @Query()
    async navigationMenu(
        @Ctx() ctx: RequestContext,
        @Args() args: { identifier: string },
    ): Promise<NavigationMenu | undefined> {
        return this.navigationService.getMenuByIdentifier(ctx, args.identifier);
    }
}

@Resolver('NavigationItem')
export class NavigationItemResolver {
    constructor(private collectionService: CollectionService) {}

    /**
     * Resolved through `CollectionService` rather than a raw relation so the
     * Collection comes back translated for the request's language code.
     */
    @ResolveField()
    async collection(
        @Ctx() ctx: RequestContext,
        @Parent() item: NavigationItem,
    ): Promise<Collection | undefined> {
        if (item.collectionId == null) {
            return undefined;
        }
        return this.collectionService.findOne(ctx, item.collectionId);
    }
}
