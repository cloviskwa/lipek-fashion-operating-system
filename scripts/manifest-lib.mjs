/**
 * Shared helpers for the repository manifest (generate-manifest.mjs / verify-manifest.mjs).
 *
 * The manifest is the mechanical guarantee behind
 * `docs/implementation/ROCKET_NEW_BUILD_BRIEF.md` §3: every file listed here must be
 * reproduced byte-for-byte by any downstream builder that mirrors this repository.
 *
 * Hashing is done over each file's **canonical content**, not its raw working-tree bytes:
 * text files are normalized to LF first (git stores LF; `core.autocrlf=true` checkouts on
 * Windows have CRLF on disk), binary files are hashed as-is. Without this, the same commit
 * would produce different hashes on Windows and Linux and the manifest would be useless as
 * a cross-machine fidelity check. Binary/text classification comes from git itself
 * (`git ls-files --eol`), not from a file-extension guess.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const MANIFEST_PATH = path.join(REPO_ROOT, 'docs/implementation/repo-manifest.json');

/**
 * Files deliberately outside the manifest because they *contain* the manifest —
 * hashing them would be self-referential (writing the hash changes the hash).
 */
export const EXCLUDED = [
  'docs/implementation/repo-manifest.json',
  'docs/implementation/ROCKET_NEW_BUILD_BRIEF.md',
];

const git = (args) =>
  execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });

/**
 * Every path git considers part of the project (tracked plus untracked-but-not-ignored),
 * with git's own text/binary verdict for each.
 * @returns {Map<string, {isBinary: boolean}>}
 */
export function listProjectFiles() {
  const records = git(['ls-files', '--eol', '-z', '--cached', '--others', '--exclude-standard'])
    .split('\0')
    .filter(Boolean);
  const files = new Map();
  for (const record of records) {
    const tab = record.indexOf('\t');
    const relPath = tab === -1 ? record : record.slice(tab + 1);
    if (EXCLUDED.includes(relPath)) continue;
    files.set(relPath, {
      isBinary: /[iw]\/-text/.test(record.slice(0, tab === -1 ? undefined : tab)),
    });
  }
  return new Map([...files].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

/** Canonical bytes for a file: LF-normalized for text, untouched for binary. */
export function canonicalContent(relPath, isBinary) {
  const buf = readFileSync(path.join(REPO_ROOT, relPath));
  if (isBinary) return buf;
  return Buffer.from(buf.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
}

export function hashFile(relPath, isBinary) {
  const content = canonicalContent(relPath, isBinary);
  return {
    path: relPath,
    bytes: content.length,
    sha256: createHash('sha256').update(content).digest('hex'),
    ...(isBinary ? { binary: true } : {}),
  };
}

export function buildManifest() {
  const files = [...listProjectFiles()].map(([relPath, { isBinary }]) =>
    hashFile(relPath, isBinary),
  );
  return {
    manifestVersion: 1,
    description:
      'SHA-256 fidelity manifest for the LIPEK platform monorepo. Any downstream reproduction of this repository must match every entry exactly. Hashes are over canonical (LF-normalized for text, raw for binary) content, so they are identical on Windows, macOS and Linux. See docs/implementation/ROCKET_NEW_BUILD_BRIEF.md section 3.',
    excluded: EXCLUDED,
    fileCount: files.length,
    totalBytes: files.reduce((sum, f) => sum + f.bytes, 0),
    files,
  };
}

export function readManifest() {
  return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
}
