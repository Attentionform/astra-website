// Builds the showcase documents with the real ASTra MCP server and renders them at high resolution.
// Sources: showcase-src/<name>/. Output: public/showcase/<name>-p<N>.webp and src/data/showcase.json.
// Usage: node scripts/gen-showcase.mjs [name ...]
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, mkdirSync, cpSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startMcp } from './lib-mcp.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, '..');
const repo = path.resolve(process.env.ASTRA_REPO ?? path.join(site, '..'));
const cliJs = path.join(repo, 'packages/cli/dist/cli.js');
const mcpJs = path.join(repo, 'packages/mcp-server/dist/index.js');
const only = process.argv.slice(2);

const work = mkdtempSync(path.join(tmpdir(), 'astra-showcase-'));
cpSync(path.join(site, 'showcase-src'), work, { recursive: true });
const out = path.join(site, 'public', 'showcase');
mkdirSync(out, { recursive: true });

const mcp = startMcp(mcpJs, work);
await mcp.init();
const parse = (r) => { const t = (r.content ?? []).find((c) => c.type === 'text')?.text; try { return JSON.parse(t); } catch { return { raw: t }; } };
const call = async (tool, args) => { const r = await mcp.call(tool, args); const b = parse(r); if (r.isError || b.ok === false) throw new Error(`${tool}: ${JSON.stringify(b).slice(0, 600)}`); return b; };

const docs = {
  atlas: { title: 'Atlas Robotics: Q3 2026 Board Report', file: 'atlas-board-report', cover: { template: 'corporate_navy', title: 'Q3 2026 Board Report', subtitle: 'Atlas Robotics', author: 'Office of the CFO', date: 'October 2026' }, footer: 'Atlas Robotics · Confidential' },
  meridian: { title: 'Meridian Orbital: Constellation Launch Brief', file: 'meridian-launch-brief', cover: { template: 'executive', title: 'Constellation Launch Brief', subtitle: 'Meridian Orbital', author: 'Programme Office', date: 'November 2026' }, footer: 'Meridian Orbital · Programme board' },
  hale: { title: 'Master Services Agreement', file: 'hale-msa-review', cover: null, footer: 'Review draft' },
  northwind: { title: 'Adaptive Cooling for Dense Compute', file: 'northwind-whitepaper', cover: { template: 'academic', title: 'Adaptive Cooling for Dense Compute', subtitle: 'Northwind Labs technical report', author: 'Thermal Systems Group', date: '2026' }, footer: 'Northwind Labs · Technical report' },
};

const find = async (sessionId, query) => { const r = await call('search_content', { sessionId, query }); if (!r.matches?.length) throw new Error(`no match for "${query}"`); return r.matches[0].id; };
const at = '2026-10-20T09:30:00Z';

const crops = [
  { doc: 'atlas', page: 2, name: 'crop-chart', box: [120, 880, 1000, 480], width: 2000 },
  { doc: 'atlas', page: 2, name: 'crop-table', box: [70, 545, 1100, 340], width: 2200 },
  { doc: 'hale', page: 1, name: 'crop-redline', box: [70, 437, 1100, 118], width: 2200 },
];

const summary = {};
for (const [name, d] of Object.entries(docs)) {
  if (only.length && !only.includes(name)) continue;
  const dir = path.join(work, name);
  const md = readFileSync(path.join(dir, 'doc.md'), 'utf8');
  const docx = path.join(dir, `${d.file}.docx`);
  const style = existsSync(path.join(dir, 'style.md')) ? 'style.md' : undefined;
  const created = await call('new_document', { outPath: docx, template: 'blank', ...(style ? { styleGuide: style } : {}) });
  const sessionId = created.sessionId;
  await call('compose_document', { sessionId, markdown: md, allowedDir: dir, ...(style ? { styleGuide: style } : {}) });
  for (const q of ['Blank Document', 'Start typing your content here']) {
    const r = await call('search_content', { sessionId, query: q });
    if (r.matches?.length) await call('execute_batch', { sessionId, operations: [{ action: 'delete', target: r.matches[0].id }] });
  }
  if (d.cover) await call('execute_batch', { sessionId, operations: [{ action: 'coverPage', ...d.cover }] });
  // The footer goes in after the content. This used to be impossible (it dropped the list numbering relationship); the engine now preserves it.
  if (d.footer) await call('execute_batch', { sessionId, operations: [{ action: 'headerFooter', operation: 'set', targetType: 'footer', text: d.footer, alignment: 'center' }] });
  if (name === 'hale') await review(sessionId);
  const v = await call('validate_document', { sessionId });
  await call('save_document', { sessionId, outPath: docx });
  await call('close_document', { sessionId });

  const pdf = path.join(dir, `${d.file}.pdf`);
  execFileSync('node', [cliJs, 'export', docx, '--format', 'pdf', '-o', pdf, '--force'], { stdio: 'pipe' });
  execFileSync('pdftoppm', ['-r', '300', '-png', pdf, path.join(dir, 'pg')]);
  const pages = readdirSync(dir).filter((f) => /^pg-\d+\.png$/.test(f)).sort();
  pages.forEach((f, i) => {
    execFileSync('magick', [path.join(dir, f), '-resize', '1240x', '-strip', '-quality', '88', path.join(out, `${name}-p${i + 1}.webp`)]);
  });
  // Homepage detail crops are cut from the 300 dpi render and kept at twice their display width, so they stay sharp on high-density screens.
  // Boxes are x,y,w,h in 1240-px page coordinates.
  for (const c of crops.filter((k) => k.doc === name)) {
    const k = 2550 / 1240;
    const [x, y, w, h] = c.box.map((v) => Math.round(v * k));
    execFileSync('magick', [path.join(dir, pages[c.page - 1]), '-crop', `${w}x${h}+${x}+${y}`, '+repage', '-resize', `${c.width}x`, '-strip', '-quality', '90', path.join(out, `${c.name}.webp`)]);
  }
  summary[name] = { title: d.title, pages: pages.length, valid: v.ok !== false };
  console.log(name, summary[name]);
}
mcp.close();
const jsonPath = path.join(site, 'src', 'data', 'showcase.json');
const prev = existsSync(jsonPath) ? JSON.parse(readFileSync(jsonPath, 'utf8')) : {};
writeFileSync(jsonPath, JSON.stringify({ ...prev, ...summary }, null, 2) + '\n');


// Contract review: redlines and margin comments from two reviewers.
async function review(sessionId) {
  const fees = await find(sessionId, 'thirty days');
  const liab = await find(sessionId, 'total liability under this Agreement');
  const term = await find(sessionId, 'sixty days');
  await call('execute_batch', { sessionId, operations: [
    { action: 'replace', target: fees, trackChanges: true, author: 'Priya Nair', date: at, text: 'The Customer shall pay each undisputed invoice within forty-five days of receipt. Late payments accrue interest at the rate agreed in the Statement of Work.' },
    { action: 'comment', operation: 'insert', target: fees, text: 'Finance can only run payment cycles every 45 days. Proposing this as a fair middle.', author: 'Priya Nair', date: at },
    { action: 'replace', target: liab, trackChanges: true, author: 'Tomas Weber', date: '2026-10-21T14:05:00Z', text: 'Neither party total liability under this Agreement shall exceed the fees paid in the twelve months before the claim arose, except for breach of confidentiality.' },
    { action: 'comment', operation: 'insert', target: liab, text: 'We should carve out confidentiality. Uncapped exposure is the standard position here.', author: 'Tomas Weber', date: '2026-10-21T14:05:00Z' },
    { action: 'comment', operation: 'insert', target: term, text: 'Agreed. Sixty days is workable for us.', author: 'Priya Nair', date: '2026-10-22T08:10:00Z' },
  ] });
}
