import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const serverRoot = path.join(import.meta.dirname, '..', '..');
const serviceFile = path.join(
    serverRoot,
    'src',
    'plugins',
    'lipek-content',
    'services',
    'content.service.ts',
);

/**
 * `ContentService` is the only route from staff-authored content to the
 * storefront, and every one of its read methods must filter to PUBLISHED.
 * A method that forgets leaks unpublished drafts to the public API — a
 * failure that is invisible until someone notices draft copy on the live
 * site, so it is pinned here rather than left to review.
 */
const source = ts.createSourceFile(
    serviceFile,
    await readFile(serviceFile, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
);

/** Methods that legitimately return unpublished rows, with the reason why. */
const EXEMPT = new Map([
    // Categories carry no status column at all — the schema has no notion of
    // a draft category, so there is nothing to filter.
    ['getArticleCategories', 'ArticleCategory has no status column'],
]);

function publicMethodsOf(classNode) {
    return classNode.members.filter(
        member =>
            ts.isMethodDeclaration(member) &&
            !member.modifiers?.some(m => m.kind === ts.SyntaxKind.PrivateKeyword),
    );
}

function findClass(name) {
    for (const statement of source.statements) {
        if (ts.isClassDeclaration(statement) && statement.name?.text === name) {
            return statement;
        }
    }
    return undefined;
}

test('ContentService parses and declares the expected class', () => {
    assert.equal(source.parseDiagnostics.length, 0, 'content.service.ts must parse cleanly');
    assert.ok(findClass('ContentService'), 'ContentService class must exist');
});

test('every public read method filters to PUBLISHED', () => {
    const serviceClass = findClass('ContentService');
    const offenders = [];

    for (const method of publicMethodsOf(serviceClass)) {
        const name = method.name.getText(source);
        if (EXEMPT.has(name)) continue;

        const body = method.body?.getText(source) ?? '';
        if (!body.includes('ContentStatus.Published')) {
            offenders.push(name);
        }
    }

    assert.deepEqual(
        offenders,
        [],
        `these public read methods do not filter to PUBLISHED: ${offenders.join(', ')}`,
    );
});

test('exemptions are justified and still real methods', () => {
    const serviceClass = findClass('ContentService');
    const names = new Set(publicMethodsOf(serviceClass).map(m => m.name.getText(source)));

    for (const [name, reason] of EXEMPT) {
        assert.ok(names.has(name), `exempt method ${name} no longer exists — remove the exemption`);
        assert.ok(reason.length > 10, `exemption for ${name} must state why`);
    }
});

test('the banner window is applied in the query, not left to callers', () => {
    const serviceClass = findClass('ContentService');
    const method = publicMethodsOf(serviceClass).find(
        m => m.name.getText(source) === 'getActiveBanners',
    );
    assert.ok(method, 'getActiveBanners must exist');

    const body = method.body.getText(source);
    // An expired or not-yet-started banner must be excluded in SQL, so a
    // caller cannot surface one by forgetting to check the dates.
    assert.match(body, /LessThanOrEqual\(\s*now\s*\)/, 'must bound scheduledAt');
    assert.match(body, /MoreThan\(\s*now\s*\)/, 'must bound expiresAt');
    assert.match(body, /IsNull\(\)/, 'must treat null bounds as open');
});
