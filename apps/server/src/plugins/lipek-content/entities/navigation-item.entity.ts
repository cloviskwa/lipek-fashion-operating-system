import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { EntityId, VendureEntity } from '@vendure/core';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';

import { NavigationMenu } from './navigation-menu.entity';

/**
 * A single entry in a {@link NavigationMenu}, optionally nested one or more
 * levels deep to form the mega-menu columns described in the design spec
 * (`docs/architecture/storefront-design-experience-spec.md` §8.5).
 *
 * A destination is expressed in exactly one of three ways, resolved in
 * priority order by the storefront's `resolveNavigationItemHref`:
 *   1. `collectionId` -- link to a Vendure Collection (the common case)
 *   2. `pageId`       -- link to a `ContentPage` (not yet implemented; the
 *                        column exists in the database and is preserved here
 *                        so the shape stays truthful, but no rows use it)
 *   3. `url`          -- a literal internal path or external URL
 *
 * The `navigation_item` table carries no foreign keys in the LIPEK database,
 * so `collectionId`/`pageId` are plain nullable columns rather than relations.
 */
@Entity()
export class NavigationItem extends VendureEntity {
    constructor(input?: DeepPartial<NavigationItem>) {
        super(input);
    }

    @Column()
    label: string;

    /** Literal href, used only when no collection/page is set. */
    @Column({ type: 'varchar', nullable: true })
    url: string | null;

    /** Sort order within the item's parent (or within the menu at root level). */
    @Column({ default: 0 })
    position: number;

    @Column({ default: true })
    enabled: boolean;

    @Index()
    @ManyToOne(() => NavigationMenu, menu => menu.items, { onDelete: 'CASCADE' })
    menu: NavigationMenu;

    @EntityId()
    menuId: ID;

    @Index()
    @ManyToOne(() => NavigationItem, item => item.children, { nullable: true, onDelete: 'CASCADE' })
    parent: NavigationItem | null;

    @EntityId({ nullable: true })
    parentId: ID | null;

    @OneToMany(() => NavigationItem, item => item.parent)
    children: NavigationItem[];

    @EntityId({ nullable: true })
    collectionId: ID | null;

    @EntityId({ nullable: true })
    pageId: ID | null;
}
