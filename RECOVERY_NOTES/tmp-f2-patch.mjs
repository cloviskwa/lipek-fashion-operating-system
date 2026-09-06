// One-off F2 patch: redesigns Hero/CategoryCards sections, adds TrustStripSection
// (spec §10–§12), wires the new section type, and extends home i18n messages.
// Deleted after use.
import {readFileSync, writeFileSync} from 'node:fs';

const FILE = 'apps/storefront/src/features/content/components/home-sections.tsx';
let src = readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n');

function replace(oldText, newText, label) {
    if (!src.includes(oldText)) {
        throw new Error(`ANCHOR NOT FOUND: ${label}`);
    }
    src = src.replace(oldText, newText);
}

// --- R1: imports -----------------------------------------------------------
replace(
    `import type {ReactNode} from 'react';
import {ArrowRight, MapPin, Scissors, Shirt, Sparkles, Star} from 'lucide-react';`,
    `import type {ReactNode} from 'react';
import type {LucideIcon} from 'lucide-react';
import {
    ArrowRight,
    Headphones,
    MapPin,
    PackageSearch,
    Scissors,
    ShieldCheck,
    Sparkles,
    Star,
    Store,
    Truck,
    Undo2,
} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {ImageReveal, Reveal, Stagger, StaggerItem} from '@/lib/motion';
import {cn} from '@/lib/utils';`,
    'R1 imports',
);

// --- R2 anchor: the old HeroSection body is replaced in PART3 ---------------
replace(
    `function HeroSection({section}: {section: HomeSection}) {
    const headline = asText(section.config, 'headline', 'Publish your LIPEK homepage hero');
    const subheadline = asText(
        section.config,
        'subheadline',
        'This hero is rendered from the CMS home page composition. Update the PageSection config in Dashboard to control this copy.',
    );
    const ctaLabel = asText(section.config, 'ctaLabel', 'Browse the collection');
    const ctaUrl = asText(section.config, 'ctaUrl', '/search');

    return (
        <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--lipek-accent-soft),transparent_34rem),linear-gradient(135deg,var(--lipek-bg),var(--lipek-bg-subtle))]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="container mx-auto grid min-h-[68vh] items-center gap-10 px-4 py-28 md:grid-cols-[1.1fr_0.9fr]">
                <div className="max-w-3xl space-y-8">
                    <Badge variant="outline" className="rounded-full border-primary/40 bg-primary/10 text-primary">
                        Backend-composed LIPEK storefront
                    </Badge>
                    <h1 className="text-5xl font-bold tracking-tight md:text-7xl">{headline}</h1>
                    <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">{subheadline}</p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button render={<Link href={ctaUrl} />} nativeButton={false} size="lg" className="rounded-full">
                            {ctaLabel}
                            <ArrowRight className="ml-2 size-4" />
                        </Button>
                        <Button render={<Link href="/blog" />} nativeButton={false} size="lg" variant="outline" className="rounded-full">
                            Read the style guide
                        </Button>
                    </div>
                </div>
                <div className="relative mx-auto aspect-[4/5] w-full max-w-sm rounded-[2rem] border bg-card p-4 shadow-2xl">
                    <div className="h-full rounded-[1.5rem] bg-[linear-gradient(145deg,var(--lipek-accent),var(--lipek-neutral-950))]" />
                    <div className="absolute -bottom-6 -left-6 rounded-2xl border bg-background p-5 shadow-xl">
                        <p className="text-sm text-muted-foreground">Staff-controlled</p>
                        <p className="text-2xl font-semibold">CMS live</p>
                    </div>
                </div>
            </div>
        </section>
    );
}`,
    `// PART3_HERO_NEW
`,
    'R2 HeroSection anchor',
);

// --- R3 anchor: old CategoryCardsSection body replaced in PART4 --------------
replace(
    `function CategoryCardsSection({section}: {section: HomeSection}) {
    const slugs = asList(section.config, 'collectionSlugs');
    if (!slugs.length) return null;

    const cards = slugs.map(slug => ({
        slug,
        label: slug.replace(/-/g, ' ').replace(/\\b\\w/g, char => char.toUpperCase()),
    }));

    return (
        <SectionShell tone="soft">
            <div className="container mx-auto px-4">
                <div className="mb-10 max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Catalog</p>
                    <h2 className="mt-3 text-3xl font-bold md:text-5xl">Shop by wardrobe</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {cards.map(card => (
                        <Link
                            key={card.slug}
                            href={\`/collection/\${card.slug}\`}
                            className="group rounded-3xl border bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <Shirt className="mb-10 size-8 text-primary" />
                            <h3 className="text-2xl font-semibold">{card.label}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Browse live Lipek catalog items.</p>
                        </Link>
                    ))}
                </div>
            </div>
        </SectionShell>
    );
}`,
    `// PART4_CATEGORIES_NEW
`,
    'R3 CategoryCardsSection anchor',
);

// --- R4 anchor stub ----------------------------------------------------------
replace(
    `function ServicesSection({services, currencyCode}`,
    `// PART4_TRUST_NEW
function ServicesSection({services, currencyCode}`,
    'R4 TrustStrip anchor',
);

// --- R5: KnownSection trustStrip case ----------------------------------------
replace(
    `        case 'hero':
            return <HeroSection section={section} />;`,
    `        case 'hero':
            return <HeroSection section={section} />;
        case 'trustStrip':
            return <TrustStripSection section={section} />;`,
    'R5 KnownSection case',
);

// --- HeroSection new body (spec §10) -----------------------------------------
src = src.replace(
    '// PART3_HERO_NEW',
    `function HeroSection({section}: {section: HomeSection}) {
    const campaignLabel = asText(section.config, 'campaignLabel', 'New Season');
    const headline = asText(section.config, 'headline', 'Modern African Luxury');
    const subheadline = asText(
        section.config,
        'subheadline',
        'Made to be remembered. Garments, tailoring and services crafted around your body, your style and every moment.',
    );
    const ctaLabel = asText(section.config, 'ctaLabel', 'Shop the Collection');
    const ctaUrl = asText(section.config, 'ctaUrl', '/search');
    const secondaryCtaLabel = asText(section.config, 'secondaryCtaLabel', 'Explore Tailoring');
    const secondaryCtaUrl = asText(section.config, 'secondaryCtaUrl', '/tailoring');
    const imageUrl = asText(section.config, 'imageUrl', '');
    const imageAlt = asText(section.config, 'imageAlt', headline);
    const storyTitle = asText(section.config, 'storyTitle', 'The Wedding Edit');
    const storyText = asText(section.config, 'storyText', 'Dress the moment. Own the memory.');
    const storyCtaLabel = asText(section.config, 'storyCtaLabel', 'Shop Wedding');
    const storyCtaUrl = asText(section.config, 'storyCtaUrl', '/search');

    // Spec §10: Hero Commerce Zone — campaign label -> headline -> supporting
    // text -> CTAs -> imagery -> featured story card, choreographed on mount.
    // All copy and the campaign image come from the PageSection config (SOT
    // §5A); the composition, motion sequence and fallbacks are design (§5B).
    return (
        <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--lipek-accent-soft),transparent_34rem),linear-gradient(135deg,var(--lipek-bg),var(--lipek-bg-subtle))]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="container mx-auto grid min-h-[62vh] items-center gap-10 px-4 py-20 md:grid-cols-[1.05fr_0.95fr] md:py-24">
                <div className="max-w-3xl space-y-6">
                    <Reveal animateOnMount delay={0}>
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">{campaignLabel}</p>
                    </Reveal>
                    <Reveal animateOnMount delay={0.08}>
                        <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">{headline}</h1>
                    </Reveal>
                    <Reveal animateOnMount delay={0.16}>
                        <p className="max-w-xl text-lg leading-8 text-muted-foreground">{subheadline}</p>
                    </Reveal>
                    <Reveal animateOnMount delay={0.24}>
                        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                            <Button render={<Link href={ctaUrl} />} nativeButton={false} size="lg" className="rounded-full">
                                {ctaLabel}
                                <ArrowRight className="ml-2 size-4" />
                            </Button>
                            <Button
                                render={<Link href={secondaryCtaUrl} />}
                                nativeButton={false}
                                size="lg"
                                variant="outline"
                                className="rounded-full"
                            >
                                {secondaryCtaLabel}
                            </Button>
                        </div>
                    </Reveal>
                </div>
                <div className="relative">
                    <ImageReveal delay={0.15} className="aspect-[4/5] w-full rounded-[2rem] border bg-card shadow-2xl">
                        {imageUrl ? (
                            // CMS-entered image URLs may point at any staff-chosen
                            // host, so this renders as plain <img> (next/image's
                            // remotePatterns is limited to the Vendure asset hosts).
                            // Optimization moves to the asset-server host when
                            // ADR-0003 object-storage providers land.
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imageUrl} alt={imageAlt} className="h-full w-full rounded-[2rem] object-cover" />
                        ) : (
                            <div className="h-full w-full rounded-[2rem] bg-[linear-gradient(145deg,var(--lipek-accent),var(--lipek-neutral-950))]" />
                        )}
                    </ImageReveal>
                    <Reveal
                        animateOnMount
                        delay={0.5}
                        className="absolute -bottom-4 left-4 max-w-[16rem] rounded-2xl border bg-background/95 p-5 shadow-xl backdrop-blur md:-left-6"
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{storyTitle}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{storyText}</p>
                        <Link
                            href={storyCtaUrl}
                            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                        >
                            {storyCtaLabel}
                            <ArrowRight className="size-4" aria-hidden />
                        </Link>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}`,
);

// --- CategoryCardsSection new body (spec §12) ---------------------------------
src = src.replace(
    '// PART4_CATEGORIES_NEW',
    `// Spec §12: mixed-size asymmetric bento — the first category is the large
// feature, the second spans wide, the rest fill single cells, the fifth (if
// present) spans wide again. Dense flow keeps the grid tight at any count.
const CATEGORY_BENTO_SPANS = [
    'sm:col-span-2 md:row-span-2',
    'md:col-span-2',
    '',
    '',
    'md:col-span-2',
] as const;

async function CategoryCardsSection({section}: {section: HomeSection}) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    const slugs = asList(section.config, 'collectionSlugs');
    if (!slugs.length) return null;

    const labels = asList(section.config, 'labels');
    const images = asList(section.config, 'images');

    const cards = slugs.map((slug, index) => ({
        slug,
        label: labels[index] ?? slug.replace(/-/g, ' ').replace(/\\b\\w/g, char => char.toUpperCase()),
        image: images[index] ?? '',
    }));

    return (
        <SectionShell tone="soft">
            <div className="container mx-auto px-4">
                <div className="mb-10 max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">{t('categories.eyebrow')}</p>
                    <h2 className="mt-3 text-3xl font-bold md:text-5xl">{t('categories.title')}</h2>
                </div>
                <Stagger className="grid auto-rows-[minmax(11rem,auto)] grid-flow-dense gap-4 sm:grid-cols-2 md:grid-cols-4">
                    {cards.map((card, index) => (
                        <StaggerItem
                            key={card.slug}
                            className={cn('h-full', CATEGORY_BENTO_SPANS[index % CATEGORY_BENTO_SPANS.length])}
                        >
                            <Link
                                href={\`/collection/\${card.slug}\`}
                                className="group relative flex h-full min-h-44 flex-col justify-end overflow-hidden rounded-3xl border bg-card p-6 transition-shadow duration-300 hover:shadow-xl"
                            >
                                {card.image ? (
                                    // See HeroSection: CMS-hosted imagery renders as plain <img>.
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={card.image}
                                        alt=""
                                        aria-hidden
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                    />
                                ) : (
                                    <div
                                        aria-hidden
                                        className="absolute inset-0 bg-[linear-gradient(145deg,var(--lipek-accent-soft),var(--lipek-bg-subtle))] transition-transform duration-500 ease-out group-hover:scale-105"
                                    />
                                )}
                                <div
                                    aria-hidden
                                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent"
                                />
                                <div className="relative mt-auto">
                                    <h3 className="text-xl font-semibold text-white md:text-2xl">{card.label}</h3>
                                    <span className="relative mt-1 inline-flex translate-y-1 items-center gap-1 text-sm font-medium text-white/85 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                        {t('categories.shopNow')}
                                        <ArrowRight className="size-4" aria-hidden />
                                    </span>
                                </div>
                            </Link>
                        </StaggerItem>
                    ))}
                </Stagger>
            </div>
        </SectionShell>
    );
}`,
);

// --- TrustStripSection (spec §11), inserted before ServicesSection ------------
src = src.replace(
    '// PART4_TRUST_NEW',
    `type TrustItem = {
    icon: LucideIcon | null;
    label: string;
};

/**
 * Spec §11 — Trust Strip. Desktop: compact evenly-spread row; mobile:
 * horizontally scrollable. The default items are frontend-owned service
 * microcopy (SOT §5B / spec §48); a config \`items\` list lets staff
 * override them without a code change (SOT §5A).
 */
async function TrustStripSection({section}: {section: HomeSection}) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    const customItems = asList(section.config, 'items');
    const items: TrustItem[] = customItems.length
        ? customItems.map(label => ({icon: null, label}))
        : [
              {icon: Truck, label: t('trustStrip.freeShipping')},
              {icon: ShieldCheck, label: t('trustStrip.securePayment')},
              {icon: Undo2, label: t('trustStrip.easyReturns')},
              {icon: Scissors, label: t('trustStrip.customTailoring')},
              {icon: PackageSearch, label: t('trustStrip.orderTracking')},
              {icon: Headphones, label: t('trustStrip.support')},
              {icon: Store, label: t('trustStrip.pickupDelivery')},
          ];

    return (
        <div className="border-b border-border/60 bg-background">
            <div className="container mx-auto px-4">
                <ul className="flex gap-8 overflow-x-auto py-4 md:justify-between md:overflow-x-visible">
                    {items.map((item, index) => (
                        <li
                            key={\`\${item.label}-\${index}\`}
                            className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground"
                        >
                            {item.icon ? (
                                <item.icon className="size-4 text-primary" aria-hidden />
                            ) : (
                                <span aria-hidden className="size-1.5 rounded-full bg-primary" />
                            )}
                            <span className="whitespace-nowrap">{item.label}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}`,
);

// --- Finalize: write home-sections.tsx (LF) + home messages (BOM-free) --------
writeFileSync(FILE, src, 'utf8');

for (const [file, additions] of [
    [
        'apps/storefront/src/site/home/messages/en.json',
        {
            trustStrip: {
                freeShipping: 'Free Shipping',
                securePayment: 'Secure Payment',
                easyReturns: 'Easy Returns',
                customTailoring: 'Custom Tailoring',
                orderTracking: 'Order Tracking',
                support: '24/7 Support',
                pickupDelivery: 'Pickup & Delivery',
            },
            categories: {
                eyebrow: 'Featured Categories',
                title: 'Find Your Wardrobe',
                shopNow: 'Shop now',
            },
        },
    ],
    [
        'apps/storefront/src/site/home/messages/de.json',
        {
            trustStrip: {
                freeShipping: 'Kostenloser Versand',
                securePayment: 'Sichere Zahlung',
                easyReturns: 'Einfache Rückgaben',
                customTailoring: 'Maßschneiderei',
                orderTracking: 'Sendungsverfolgung',
                support: '24/7 Support',
                pickupDelivery: 'Abholung & Lieferung',
            },
            categories: {
                eyebrow: 'Ausgewählte Kategorien',
                title: 'Finde deinen Stil',
                shopNow: 'Jetzt kaufen',
            },
        },
    ],
] as const) {
    const json = JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
    json.Home = {...json.Home, ...additions};
    writeFileSync(file, JSON.stringify(json, null, 2) + '\n', 'utf8');
}

console.log('F2 patch applied: home-sections.tsx + home messages (en/de)');



