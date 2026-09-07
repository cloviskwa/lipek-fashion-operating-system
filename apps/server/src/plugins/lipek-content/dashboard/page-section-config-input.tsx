import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { DashboardFormComponentProps, Input, Label, Textarea } from '@vendure/dashboard';

/**
 * `CONTENT-004`: the fields a known `sectionType` needs, keyed by that
 * string -- a Dashboard-only editing convenience, not a server-enforced
 * list. `PageSection.sectionType` deliberately stays a plain string (see
 * that entity's own doc comment): SOT §5A says "the code defines section
 * component types and rendering rules," and that code is the storefront's
 * eventual rendering layer (Phase 3), not this Admin API. A `sectionType`
 * outside this list still round-trips fine via the raw JSON fallback below
 * -- nothing here can make a section un-editable, only less convenient to
 * edit until its type is added here.
 */
const KNOWN_SECTION_TYPE_FIELDS: Record<string, Array<{ key: string; label: string }>> = {
    hero: [
        { key: 'headline', label: 'Headline' },
        { key: 'subheadline', label: 'Subheadline' },
        { key: 'imageAssetId', label: 'Image asset ID' },
        { key: 'ctaLabel', label: 'CTA label' },
        { key: 'ctaUrl', label: 'CTA URL' },
    ],
    featuredCollection: [{ key: 'collectionId', label: 'Collection ID' }],
    newArrivals: [{ key: 'collectionId', label: 'Collection ID' }],
    categoryCards: [{ key: 'collectionIds', label: 'Collection IDs (comma-separated)' }],
    tailoringCta: [
        { key: 'headline', label: 'Headline' },
        { key: 'ctaLabel', label: 'CTA label' },
        { key: 'ctaUrl', label: 'CTA URL' },
    ],
    promotionalBanner: [{ key: 'bannerId', label: 'Banner ID' }],
    shopTheLook: [{ key: 'productIds', label: 'Product IDs (comma-separated)' }],
    testimonials: [{ key: 'testimonialIds', label: 'Testimonial IDs (comma-separated)' }],
    editorialFeature: [{ key: 'articleId', label: 'Article ID' }],
    newsletterCta: [
        { key: 'headline', label: 'Headline' },
        { key: 'subheadline', label: 'Subheadline' },
    ],
};

/** Free typing of invalid intermediate JSON must not be fought by the controlled input, so the raw text is local state, lifted to `onChange` only once it parses. */
function JsonFallbackEditor({
    value,
    onChange,
}: {
    value: Record<string, unknown> | null;
    onChange: (next: Record<string, unknown>) => void;
}) {
    const [text, setText] = useState(() => JSON.stringify(value ?? {}, null, 2));
    return (
        <Textarea
            value={text}
            rows={6}
            onChange={e => {
                const next = e.target.value;
                setText(next);
                try {
                    const parsed = JSON.parse(next);
                    if (parsed && typeof parsed === 'object') {
                        onChange(parsed);
                    }
                } catch {
                    // Invalid JSON mid-edit -- keep the raw text on screen, don't propagate yet.
                }
            }}
        />
    );
}

/**
 * Registered via `detailForms` in `dashboard/index.tsx` as the input for
 * `PageSection`'s `config` field, replacing the plain `TextInput` fallback
 * `DetailPage`'s auto-form would otherwise use for a `JSON`-typed field
 * (which can't correctly display/edit an object value). Reads the sibling
 * `sectionType` field via `useFormContext()` to pick which known fields to
 * render; falls back to a raw JSON editor for anything not in
 * `KNOWN_SECTION_TYPE_FIELDS`.
 */
export function PageSectionConfigInput(props: Readonly<DashboardFormComponentProps>) {
    const { watch } = useFormContext();
    const sectionType = watch('sectionType') as string | undefined;
    const knownFields = sectionType ? KNOWN_SECTION_TYPE_FIELDS[sectionType] : undefined;
    const config = (props.value as Record<string, unknown> | null | undefined) ?? {};

    if (!knownFields) {
        return (
            <div className="space-y-1">
                {sectionType && (
                    <p className="text-sm text-muted-foreground">
                        No known field layout for sectionType "{sectionType}" -- editing as raw JSON.
                    </p>
                )}
                <JsonFallbackEditor value={config} onChange={props.onChange} />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {knownFields.map(fieldDef => (
                <div key={fieldDef.key} className="space-y-1">
                    <Label>{fieldDef.label}</Label>
                    <Input
                        value={typeof config[fieldDef.key] === 'string' ? (config[fieldDef.key] as string) : ''}
                        onChange={e => props.onChange({ ...config, [fieldDef.key]: e.target.value })}
                    />
                </div>
            ))}
        </div>
    );
}