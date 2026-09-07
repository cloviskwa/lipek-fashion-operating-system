import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const root = path.join(import.meta.dirname, '..', '..');
const source = path.join(root, 'src', 'features', 'navigation', 'href.ts');

/**
 * `href.ts` is deliberately import-free, so it can be transpiled and loaded
 * on its own without the Next.js cache or the Vendure client.
 */
const {outputText} = ts.transpileModule(await readFile(source, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022},
});
const {resolveNavigationItemHref} = await import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);

const item = (overrides) => ({id: '1', label: 'Item', ...overrides});

test('a linked collection resolves to its collection route', () => {
    assert.equal(
        resolveNavigationItemHref(item({collection: {slug: 'men-african-wear'}})),
        '/collection/men-african-wear',
    );
});

test('a collection wins over a literal url', () => {
    // Re-pointing an item at a collection in the Dashboard must take effect
    // even if a stale url is still stored on the row.
    assert.equal(
        resolveNavigationItemHref(item({url: '/stale', collection: {slug: 'sale'}})),
        '/collection/sale',
    );
});

test('a literal url is used when no collection is linked', () => {
    assert.equal(resolveNavigationItemHref(item({url: '/privacy'})), '/privacy');
});

test('external urls are passed through unchanged', () => {
    assert.equal(
        resolveNavigationItemHref(item({url: 'https://example.com/lookbook'})),
        'https://example.com/lookbook',
    );
});

test('an item with no destination resolves to null', () => {
    assert.equal(resolveNavigationItemHref(item({})), null);
    assert.equal(resolveNavigationItemHref(item({url: null, collection: null})), null);
});

test('a blank or whitespace-only url is treated as no destination', () => {
    // Guards against rendering an item that links to the current page.
    assert.equal(resolveNavigationItemHref(item({url: ''})), null);
    assert.equal(resolveNavigationItemHref(item({url: '   '})), null);
});

test('a collection with an empty slug falls back to the url', () => {
    assert.equal(
        resolveNavigationItemHref(item({url: '/fallback', collection: {slug: ''}})),
        '/fallback',
    );
});
