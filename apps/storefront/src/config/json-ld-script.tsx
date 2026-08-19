import type {JsonLdNode} from './json-ld';

/** Renders a merged JSON-LD graph (see `mergeJsonLdGraph` in `./json-ld`) into a `<script>` tag. Renders nothing if `schema` is absent. */
export function JsonLdScript({schema}: {schema: JsonLdNode | null | undefined}) {
    if (!schema) {
        return null;
    }

    // JSON.stringify output only, not user-controlled HTML.
    return (
        <script
            id="json-ld-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}}
        />
    );
}
