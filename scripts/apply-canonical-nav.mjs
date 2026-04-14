// Apply canonical nav to every non-article page. Replaces existing <nav>...</nav>
// with the partial at src/canonical-nav.html. Idempotent via data-qis-nav="v1" marker.

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');

const partialPath = path.join(REPO, 'src', 'canonical-nav.html');
const partial = readFileSync(partialPath, 'utf8');

const iaPath = path.join(REPO, 'data', 'canonical-ia.json');
const ia = JSON.parse(readFileSync(iaPath, 'utf8'));

const archivedPages = new Set(ia.archived_pages.map(p => p.page));
const allHtml = readdirSync(REPO).filter(f => f.endsWith('.html'));
const nonArticles = allHtml.filter(f => !f.startsWith('article-') && !archivedPages.has(f));

// Match a full <nav ...>...</nav> block (DOTALL)
const navRe = /<nav\b[^>]*>[\s\S]*?<\/nav>/;

let changed = 0;
let skipped = [];

for (const f of nonArticles) {
  const full = path.join(REPO, f);
  const html = readFileSync(full, 'utf8');

  if (html.includes('data-qis-nav="v1"')) {
    skipped.push([f, 'already canonical']);
    continue;
  }

  if (!navRe.test(html)) {
    skipped.push([f, 'no <nav> found — skipping']);
    continue;
  }

  const out = html.replace(navRe, partial);
  if (out === html) {
    skipped.push([f, 'no change']);
    continue;
  }

  writeFileSync(full, out);
  changed++;
  console.log(`  ✓ ${f}`);
}

console.log(`\nApplied canonical nav to ${changed} non-article pages.`);
if (skipped.length) {
  console.log(`\nSkipped (${skipped.length}):`);
  for (const [f, reason] of skipped) console.log(`  • ${f} — ${reason}`);
}
