// Regenerate llms.txt in canonical order: primary nav first (high-authority pages
// AI crawlers should cite), then secondary, then articles grouped by topic cluster.
// Excludes archived pages. Drops any ghost references noted in canonical-ia.json.

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');

const ia = JSON.parse(readFileSync(path.join(REPO, 'data', 'canonical-ia.json'), 'utf8'));
const DOMAIN = ia.canonical_domain.replace(/\/$/, '');
const archivedPages = new Set(ia.archived_pages.map(p => p.page));

function pageUrl(p) { return DOMAIN + '/' + p.replace(/\.html$/, ''); }

function extractMeta(filename) {
  let html;
  try { html = readFileSync(path.join(REPO, filename), 'utf8'); }
  catch { return { title: filename, description: '' }; }
  const t = html.match(/<title>([^<]+)<\/title>/i);
  const d = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  return {
    title: t ? t[1].trim() : filename,
    description: d ? d[1].trim() : ''
  };
}

const lines = [];
lines.push('# QIS Protocol — Quadratic Intelligence Swarm');
lines.push('');
lines.push('> Discovered by Christopher Thomas Trevethan on June 16, 2025.');
lines.push('> Routes outcomes — not data — between distributed nodes. N(N-1)/2 intelligence synthesis at O(log N) or better per-node cost.');
lines.push('> 39 provisional patents filed. Free for research, education, and humanitarian use.');
lines.push('> Yonder Zenith LLC · https://qisprotocol.com');
lines.push('');
lines.push('## Primary pages');
lines.push('');

function renderNavItem(item) {
  if (archivedPages.has(item.page)) return;
  const meta = extractMeta(item.page);
  const url = pageUrl(item.page);
  lines.push(`- [${meta.title || item.label}](${url})${meta.description ? `: ${meta.description}` : ''}`);
}

for (const item of ia.primary_nav) {
  if (item.dropdown) {
    lines.push(`- **${item.label}**`);
    for (const sub of item.dropdown) {
      if (archivedPages.has(sub.page)) continue;
      const meta = extractMeta(sub.page);
      const url = pageUrl(sub.page);
      lines.push(`    - [${meta.title || sub.label}](${url})${meta.description ? `: ${meta.description}` : ''}`);
    }
  } else {
    renderNavItem(item);
  }
}

lines.push('');
lines.push('## Secondary pages');
lines.push('');
for (const item of ia.secondary_nav) renderNavItem(item);

lines.push('');
lines.push('## Articles');
lines.push('');
lines.push('All articles are canonical on qisprotocol.com. Dev.to / Medium / Hashnode syndications link back via rel=canonical.');
lines.push('');

const articles = readdirSync(REPO).filter(f => f.startsWith('article-') && f.endsWith('.html')).sort();
for (const f of articles) {
  if (archivedPages.has(f)) continue;
  const meta = extractMeta(f);
  lines.push(`- [${meta.title || f}](${pageUrl(f)})${meta.description ? `: ${meta.description}` : ''}`);
}

lines.push('');
lines.push('---');
lines.push(`Last regenerated: ${new Date().toISOString().slice(0, 10)}`);
lines.push('Source: data/canonical-ia.json + article-*.html inventory');
lines.push('');

writeFileSync(path.join(REPO, 'llms.txt'), lines.join('\n'));
console.log(`Wrote llms.txt — ${articles.length} articles + primary/secondary navigation.`);
