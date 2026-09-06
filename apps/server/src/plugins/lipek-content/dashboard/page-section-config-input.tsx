  1 | import { useState } from 'react';
  2 | import { useFormContext } from 'react-hook-form';
  3 | import { DashboardFormComponentProps, Input, Label, Textarea } from '@vendure/dashboard';
  4 | 
  5 | /**
  6 |  * `CONTENT-004`: the fields a known `sectionType` needs, keyed by that
  7 |  * string -- a Dashboard-only editing convenience, not a server-enforced
  8 |  * list. `PageSection.sectionType` deliberately stays a plain string (see
  9 |  * that entity's own doc comment): SOT §5A says "the code defines section
 10 |  * component types and rendering rules," and that code is the storefront's
 11 |  * eventual rendering layer (Phase 3), not this Admin API. A `sectionType`
 12 |  * outside this list still round-trips fine via the raw JSON fallback below
 13 |  * -- nothing here can make a section un-editable, only less convenient to
 14 |  * edit until its type is added here.
 15 |  */
 16 | const KNOWN_SECTION_TYPE_FIELDS: Record<string, Array<{ key: string; label: string }>> = {
 17 |     hero: [
 18 |         { key: 'headline', label: 'Headline' },
 19 |         { key: 'subheadline', label: 'Subheadline' },
 20 |         { key: 'imageAssetId', label: 'Image asset ID' },
 21 |         { key: 'ctaLabel', label: 'CTA label' },
 22 |         { key: 'ctaUrl', label: 'CTA URL' },
 23 |     ],
 24 |     featuredCollection: [{ key: 'collectionId', label: 'Collection ID' }],
 25 |     newArrivals: [{ key: 'collectionId', label: 'Collection ID' }],
 26 |     categoryCards: [{ key: 'collectionIds', label: 'Collection IDs (comma-separated)' }],
 27 |     tailoringCta: [
 28 |         { key: 'headline', label: 'Headline' },
 29 |         { key: 'ctaLabel', label: 'CTA label' },
 30 |         { key: 'ctaUrl', label: 'CTA URL' },
 31 |     ],
 32 |     promotionalBanner: [{ key: 'bannerId', label: 'Banner ID' }],
 33 |     shopTheLook: [{ key: 'productIds', label: 'Product IDs (comma-separated)' }],
 34 |     testimonials: [{ key: 'testimonialIds', label: 'Testimonial IDs (comma-separated)' }],
 35 |     editorialFeature: [{ key: 'articleId', label: 'Article ID' }],
 36 |     newsletterCta: [
 37 |         { key: 'headline', label: 'Headline' },
 38 |         { key: 'subheadline', label: 'Subheadline' },
 39 |     ],
 40 | };
 41 | 
 42 | /** Free typing of invalid intermediate JSON must not be fought by the controlled input, so the raw text is local state, lifted to `onChange` only once it parses. */
 43 | function JsonFallbackEditor({
 44 |     value,
 45 |     onChange,
 46 | }: {
 47 |     value: Record<string, unknown> | null;
 48 |     onChange: (next: Record<string, unknown>) => void;
 49 | }) {
 50 |     const [text, setText] = useState(() => JSON.stringify(value ?? {}, null, 2));
 51 |     return (
 52 |         <Textarea
 53 |             value={text}
 54 |             rows={6}
 55 |             onChange={e => {
 56 |                 const next = e.target.value;
 57 |                 setText(next);
 58 |                 try {
 59 |                     const parsed = JSON.parse(next);
 60 |                     if (parsed && typeof parsed === 'object') {
 61 |                         onChange(parsed);
 62 |                     }
 63 |                 } catch {
 64 |                     // Invalid JSON mid-edit -- keep the raw text on screen, don't propagate yet.
 65 |                 }
 66 |             }}
 67 |         />
 68 |     );
 69 | }
 70 | 
 71 | /**
 72 |  * Registered via `detailForms` in `dashboard/index.tsx` as the input for
 73 |  * `PageSection`'s `config` field, replacing the plain `TextInput` fallback
 74 |  * `DetailPage`'s auto-form would otherwise use for a `JSON`-typed field
 75 |  * (which can't correctly display/edit an object value). Reads the sibling
 76 |  * `sectionType` field via `useFormContext()` to pick which known fields to
 77 |  * render; falls back to a raw JSON editor for anything not in
 78 |  * `KNOWN_SECTION_TYPE_FIELDS`.
 79 |  */
 80 | export function PageSectionConfigInput(props: Readonly<DashboardFormComponentProps>) {
 81 |     const { watch } = useFormContext();
 82 |     const sectionType = watch('sectionType') as string | undefined;
 83 |     const knownFields = sectionType ? KNOWN_SECTION_TYPE_FIELDS[sectionType] : undefined;
 84 |     const config = (props.value as Record<string, unknown> | null | undefined) ?? {};
 85 | 
 86 |     if (!knownFields) {
 87 |         return (
 88 |             <div className="space-y-1">
 89 |                 {sectionType && (
 90 |                     <p className="text-sm text-muted-foreground">
 91 |                         No known field layout for sectionType "{sectionType}" -- editing as raw JSON.
 92 |                     </p>
 93 |                 )}
 94 |                 <JsonFallbackEditor value={config} onChange={props.onChange} />
 95 |             </div>
 96 |         );
 97 |     }
 98 | 
 99 |     return (
100 |         <div className="space-y-3">
101 |             {knownFields.map(fieldDef => (
102 |                 <div key={fieldDef.key} className="space-y-1">
103 |                     <Label>{fieldDef.label}</Label>
104 |                     <Input
105 |                         value={typeof config[fieldDef.key] === 'string' ? (config[fieldDef.key] as string) : ''}
106 |                         onChange={e => props.onChange({ ...config, [fieldDef.key]: e.target.value })}
107 |                     />
108 |                 </div>
109 |             ))}
110 |         </div>
111 |     );
112 | }