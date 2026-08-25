#!/usr/bin/env node
/**
 * Verify this checkout against docs/implementation/repo-manifest.json.
 *
 * Exit 0 = byte-for-byte match with the manifest.
 * Exit 1 = a manifest file is missing, its content changed, or an unlisted file was added.
 *
 * This is the acceptance check for any downstream reproduction of the repository
 * (docs/implementation/ROCKET_NEW_BUILD_BRIEF.md section 16). Hashes compare canonical
 * content, so a Windows CRLF checkout and a Linux LF checkout of the same commit both pass.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';

import {
  hashFile,
  listProjectFiles,
  MANIFEST_PATH,
  readManifest,
  REPO_ROOT,
} from './manifest-lib.mjs';

if (!existsSync(MANIFEST_PATH)) {
  console.error(
    `No manifest at ${path.relative(REPO_ROOT, MANIFEST_PATH)}. Run: node scripts/generate-manifest.mjs`,
  );
  process.exit(1);
}

const manifest = readManifest();
const expected = new Map(manifest.files.map((f) => [f.path, f]));
const actual = listProjectFiles();

const missing = [];
const changed = [];
const extra = [];

for (const [relPath, want] of expected) {
  const found = actual.get(relPath);
  if (!found) {
    missing.push(relPath);
    continue;
  }
  const got = hashFile(relPath, found.isBinary);
  if (got.sha256 !== want.sha256) {
    changed.push({
      path: relPath,
      expected: want.sha256,
      actual: got.sha256,
      expectedBytes: want.bytes,
      actualBytes: got.bytes,
    });
  }
}
for (const relPath of actual.keys()) {
  if (!expected.has(relPath)) extra.push(relPath);
}

const report = (label, items, render) => {
  if (!items.length) return;
  console.error(`\n${label} (${items.length}):`);
  for (const item of items) console.error(`  ${render(item)}`);
};

report('MISSING — listed in the manifest but absent here', missing, (p) => p);
report(
  'CHANGED — content differs from the manifest',
  changed,
  (c) =>
    `${c.path}\n    expected ${c.expected} (${c.expectedBytes} bytes)\n    actual   ${c.actual} (${c.actualBytes} bytes)`,
);
report('EXTRA — present here but not in the manifest', extra, (p) => p);

const failures = missing.length + changed.length + extra.length;
if (failures > 0) {
  console.error(
    `\nManifest verification FAILED: ${failures} discrepancies across ${manifest.fileCount} manifest entries.`,
  );
  console.error(
    'If the change was intentional in this repository, regenerate: node scripts/generate-manifest.mjs',
  );
  process.exit(1);
}

console.log(`Manifest verification passed: ${manifest.fileCount} files match exactly.`);
