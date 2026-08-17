import type { JsonLdNode } from '@/lib/schema/builders';

export default function JsonLdScript({ schema }: { schema: JsonLdNode | null | undefined }) {
  if (!schema) return null;

  return (
    <script
      id="json-ld-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
