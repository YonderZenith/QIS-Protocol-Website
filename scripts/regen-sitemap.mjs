// Regenerate sitemap.xml from canonical-ia.json + every article-*.html on disk.
// Archived pages are EXCLUDED. URLs use clean no-extension paths where the IA
// declares them, and the canonical_domain prefix.

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');

const ia = JSON.parse(readFileSync(path.join(REPO, 'data', 'canonical-ia.json'), 'utf8'));
const DOMAIN = ia.canonical_domain.replace(/\/$/, '');
const archivedPages = new Set(ia.archived_pages.map(p => p.page));

const entries = [];
const seen = new Set();

function push(url, { priority, changefreq, lastmod }) {
  if (seen.has(url)) return;
  seen.add(url);
  entries.push({ url, priority, changefreq, lastmod });
}

function fileMtimeISO(filename) {
  try {
    const s = statSync(path.join(REPO, filename));
    return s.mtime.toISOString().slice(0, 10);
  } catch { return ia.last_updated; }
}

// Primary + secondary nav entries
function addEntry(e) {
  if (!e.page) return;
  if (archivedPages.has(e.page)) return;
  const href = e.href.endsWith('/') ? '/' : e.href;
  const url = DOMAIN + (href === '/' ? '/' : href);
  push(url, { priority: e.priority, changefreq: e.changefreq, lastmod: fileMtimeISO(e.page) });
}

for (const item of ia.primary_nav) {
  if (item.dropdown) {
    for (const sub of item.dropdown) addEntry(sub);
  } else {
    addEntry(item);
  }
}
for (const item of ia.secondary_nav) addEntry(item);

// Every article — /article-<slug>
const articles = readdirSync(REPO).filter(f => f.startsWith('article-') && f.endsWith('.html'));
for (const f of articles) {
  if (archivedPages.has(f)) continue;
  const slug = f.replace(/\.html$/, '');
  push(DOMAIN + '/' + slug, { priority: 0.7, changefreq: 'monthly', lastmod: fileMtimeISO(f) });
}

// XML output
const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
for (const e of entries) {
  lines.push('  <url>');
  lines.push(`    <loc>${e.url}</loc>`);
  if (e.lastmod) lines.push(`    <lastmod>${e.lastmod}</lastmod>`);
  if (e.changefreq) lines.push(`    <changefreq>${e.changefreq}</changefreq>`);
  if (typeof e.priority === 'number') lines.push(`    <priority>${e.priority.toFixed(1)}</priority>`);
  lines.push('  </url>');
}
lines.push('</urlset>');

writeFileSync(path.join(REPO, 'sitemap.xml'), lines.join('\n') + '\n');
console.log(`Wrote sitemap.xml with ${entries.length} URLs (${articles.length} articles + ${entries.length - articles.length} primary/secondary).`);
