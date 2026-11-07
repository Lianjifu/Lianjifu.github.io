#!/usr/bin/env node
/**
 * Recompute the article body baseline in docs/article-manifest.json.
 *
 * The baseline covers each article's post-body element — the article content
 * itself — and excludes the surrounding shell (TOC aside, pager, navigation),
 * so re-styling the shell never invalidates it.
 *
 * Run after a legitimate body change, review the reported diff, then commit:
 *   node scripts/update-manifest.cjs          # dry run, prints what changes
 *   node scripts/update-manifest.cjs --write  # rewrite the manifest
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(ROOT, 'docs/article-manifest.json');
const EXPECTED = 91;

/** The post-body element: from its opening tag to the close before the TOC aside. */
function measureBody(source) {
  const begin = source.indexOf('<div class="post-body"');
  if (begin < 0) throw new Error('post-body not found');
  const aside = source.indexOf('<aside class="article-toc-aside">', begin);
  if (aside < 0) throw new Error('TOC aside not found');
  const end = source.lastIndexOf('</div>', aside) + 6;
  if (end <= begin) throw new Error('post-body bounds are wrong');
  return source.slice(begin, end);
}

/** Headings the article TOC links to: h2/h3/h4 carrying an id, minus the skipped ones. */
function countHeadings(body) {
  const h2only = body
    .slice(0, body.indexOf('>'))
    .includes('data-toc-mode="h2"');
  return [...body.matchAll(/<h([234])\b([^>]*)>([\s\S]*?)<\/h\1>/g)].filter(
    (m) =>
      !m[2].includes('data-toc-skip') &&
      (!h2only || m[1] === '2') &&
      /\bid="([^"]+)"/.test(m[2]),
  ).length;
}

const rows = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
if (rows.length !== EXPECTED)
  throw new Error(`Expected ${EXPECTED} articles, found ${rows.length}`);

const changed = [];
const next = rows.map((row) => {
  const body = measureBody(
    fs.readFileSync(path.join(ROOT, row.file), 'utf8'),
  );
  const bodyHash = crypto.createHash('sha256').update(body).digest('hex');
  const bodyLength = body.length;
  const headings = countHeadings(body);
  if (
    row.bodyHash !== bodyHash ||
    row.bodyLength !== bodyLength ||
    row.headings !== headings
  ) {
    changed.push({ file: row.file, from: row, to: { bodyHash, bodyLength, headings } });
  }
  return { ...row, bodyHash, bodyLength, headings };
});

for (const c of changed) {
  console.log(`  ${c.file}`);
  console.log(`    bodyLength ${c.from.bodyLength} → ${c.to.bodyLength}`);
  console.log(`    bodyHash   ${c.from.bodyHash.slice(0, 12)}… → ${c.to.bodyHash.slice(0, 12)}…`);
  if (c.from.headings !== c.to.headings)
    console.log(`    headings   ${c.from.headings} → ${c.to.headings}`);
}

if (!process.argv.includes('--write')) {
  console.log(
    `Dry run: ${changed.length} of ${rows.length} entries would change. Re-run with --write to update docs/article-manifest.json.`,
  );
} else {
  fs.writeFileSync(MANIFEST, JSON.stringify(next, null, 2) + '\n');
  console.log(
    `Updated ${changed.length} of ${rows.length} entries in docs/article-manifest.json`,
  );
}
