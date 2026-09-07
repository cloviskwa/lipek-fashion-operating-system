import { Injectable } from '@nestjs/common';
import { ID } from '@vendure/common/lib/shared-types';
import { RequestContext, TransactionalConnection } from '@vendure/core';

import { NavigationItem } from '../entities/navigation-item.entity';
import { NavigationMenu } from '../entities/navigation-menu.entity';

/**
 * Read model for staff-managed navigation menus (`CONTENT-005`).
 *
 * Only the read side is implemented here: the storefront must never see a
 * disabled menu or item, and it must receive items already nested and
 * ordered so that no ordering logic leaks into the frontend. Staff-facing
 * write operations belong to the Dashboard extension and are not part of
 * this task.
 */
@Injectable()
export class NavigationService {
    constructor(private connection: TransactionalConnection) {}

    /**
     * Return an enabled menu by its stable identifier (`header`, `footer`),
     * with its enabled items nested into a tree and sorted by `position`.
     * Returns `undefined` when the menu does not exist or is disabled, which
     * the storefront renders as "no backend-managed menu" rather than an error.
     */
    async getMenuByIdentifier(
        ctx: RequestContext,
        identifier: string,
    ): Promise<NavigationMenu | undefined> {
        const menu = await this.connection.getRepository(ctx, NavigationMenu).findOne({
            where: { identifier, enabled: true },
        });
        if (!menu) {
            return undefined;
        }

        const items = await this.connection.getRepository(ctx, NavigationItem).find({
            where: { menuId: menu.id, enabled: true },
        });

        menu.items = this.buildTree(items);
        return menu;
    }

    /**
     * Nest a flat item list by `parentId` and sort every level by `position`.
     *
     * Items whose parent is missing or disabled are treated as roots rather
     * than silently dropped, so a staff member disabling a parent never makes
     * a whole branch vanish from the storefront without explanation.
     */
    private buildTree(items: NavigationItem[]): NavigationItem[] {
        const byId = new Map<string, NavigationItem>();
        for (const item of items) {
            item.children = [];
            byId.set(String(item.id), item);
        }

        const roots: NavigationItem[] = [];
        for (const item of items) {
            const parent = item.parentId != null ? byId.get(String(item.parentId)) : undefined;
            if (parent) {
                parent.children.push(item);
            } else {
                roots.push(item);
            }
        }

        const sortByPosition = (list: NavigationItem[]): NavigationItem[] => {
            list.sort((a, b) => a.position - b.position);
            for (const item of list) {
                sortByPosition(item.children);
            }
            return list;
        };

        return sortByPosition(roots);
    }
}
