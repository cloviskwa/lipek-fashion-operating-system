import { DeepPartial } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '@vendure/core';
import { Column, Entity, Index, OneToMany } from 'typeorm';

import { NavigationItem } from './navigation-item.entity';

/**
 * A named, staff-managed menu (`header`, `footer`, ...) rendered by the
 * storefront. Introduced by `CONTENT-001`; `CONTENT-005` is the task that
 * makes the storefront read these instead of hard-coded link lists, so that
 * "a new category appears in nav without a deploy".
 *
 * Column definitions mirror the `navigation_menu` table exactly -- the table
 * predates this entity in the LIPEK database, so this class is written to
 * match it rather than the other way round.
 */
@Entity()
export class NavigationMenu extends VendureEntity {
    constructor(input?: DeepPartial<NavigationMenu>) {
        super(input);
    }

    /** Stable lookup key used by the storefront (e.g. `header`, `footer`). */
    @Index({ unique: true })
    @Column()
    identifier: string;

    /** Human-readable name shown to staff in the Dashboard. */
    @Column()
    name: string;

    @Column({ default: true })
    enabled: boolean;

    @OneToMany(() => NavigationItem, item => item.menu)
    items: NavigationItem[];
}
