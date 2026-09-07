import { DeepPartial } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '@vendure/core';
import { Column, Entity, Index, OneToMany } from 'typeorm';

import { Article } from './article.entity';

/** A grouping for journal articles, addressed by slug in storefront routes. */
@Entity()
export class ArticleCategory extends VendureEntity {
    constructor(input?: DeepPartial<ArticleCategory>) {
        super(input);
    }

    @Column()
    name: string;

    @Index({ unique: true })
    @Column()
    slug: string;

    @OneToMany(() => Article, article => article.articleCategory)
    articles: Article[];
}
