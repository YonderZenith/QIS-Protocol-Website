// Apply canonical nav to every non-article page. Replaces existing canonical-nav
// block (v1 or v2) OR the first <nav>...</nav> with the partial at
// src/canonical-nav.html. Idempotent via data-qis-nav=<current-version>.

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');

const partialPath = path.join(REPO, 'src', 'canonical-nav.html');
const partial = readFileSync(partialPath, 'utf8');

// Extract current version from the partial itself (data-qis-nav="vN")
const versionMatch = partial.match(/data-qis-nav="(v\d+)"/);
const CURRENT_VERSION = versionMatch ? versionMatch[1] : 'v1';

const iaPath = path.join(REPO, 'data', 'canonical-ia.json');
const ia = JSON.parse(readFileSync(iaPath, 'utf8'));

const archivedPages = new Set(ia.archived_pages.map(p => p.page));
const allHtml = readdirSync(REPO).filter(f => f.endsWith('.html'));
const nonArticles = allHtml.filter(f => !f.startsWith('article-') && !archivedPages.has(f));

// Match an existing canonical-nav block (comment-to-comment) from ANY version
const canonicalBlockRe = /<!--\s*=+\s*CANONICAL NAV v\d+[^\n]*-->[\s\S]*?<!--\s*=+\s*\/CANONICAL NAV v\d+[^\n]*-->/;

// Fallback: match a full <nav ...>...</nav> block
const navRe = /<nav\b[^>]*>[\s\S]*?<\/nav>/;

let changed = 0;
let alreadyCurrent = 0;
let skipped = [];

for (const f of nonArticles) {
  const full = path.join(REPO, f);
  const html = readFileSync(full, 'utf8');

  if (html.includes(`data-qis-nav="${CURRENT_VERSION}"`)) {
    alreadyCurrent++;
    continue;
  }

  let out;
  if (canonicalBlockRe.test(html)) {
    // Replace the full canonical block (any version) with the current partial
    out = html.replace(canonicalBlockRe, partial);
  } else if (navRe.test(html)) {
    // No canonical block yet — replace the first <nav> with the partial
    out = html.replace(navRe, partial);
  } else {
    skipped.push([f, 'no <nav> and no canonical block found']);
    continue;
  }

  if (out === html) {
    skipped.push([f, 'no change produced']);
    continue;
  }

  writeFileSync(full, out);
  changed++;
  console.log(`  ✓ ${f}`);
}

console.log(`\nApplied canonical nav ${CURRENT_VERSION} to ${changed} non-article pages (${alreadyCurrent} already current).`);
if (skipped.length) {
  console.log(`\nSkipped (${skipped.length}):`);
  for (const [f, reason] of skipped) console.log(`  • ${f} — ${reason}`);
}
