// Remove ?skip=true query string sitewide. Replaces index.html?skip=true -> / (or index.html where still needed).
// Per IA decision F (2026-04-14): splash-skip preference lives in localStorage instead.

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'archive' || entry === 'node_modules' || entry === '.git') continue;
    const full = path.join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out;
}

const files = walk(REPO);
let touched = 0;
let replacements = 0;

for (const f of files) {
  const html = readFileSync(f, 'utf8');
  let out = html;
  // index.html?skip=true  -> /
  out = out.replace(/index\.html\?skip=true/g, '/');
  // bare ?skip=true (attached to /) -> ""
  out = out.replace(/(['"])\/\?skip=true(['"])/g, '$1/$2');
  out = out.replace(/\?skip=true/g, '');
  if (out !== html) {
    const count = (html.match(/\?skip=true/g) || []).length;
    writeFileSync(f, out);
    touched++;
    replacements += count;
  }
}

console.log(`Stripped ?skip=true from ${touched} files (${replacements} total replacements).`);
