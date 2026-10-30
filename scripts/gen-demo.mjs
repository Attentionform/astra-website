// Records real ASTra MCP sessions and renders the pages for the home-page demo.
// Source document: demo-src/board-report.md (+ charts/, atlas-style.md). Everything shown on the
// site is produced by the built MCP server and CLI; nothing is typed by hand.
// Output: src/data/demo-session.json, public/demo/*.webp.  Usage: node scripts/gen-demo.mjs
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, mkdirSync, cpSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startMcp } from './lib-mcp.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, '..');
const repo = path.resolve(process.env.ASTRA_REPO ?? path.join(site, '..'));
const cliJs = path.join(repo, 'packages/cli/dist/cli.js');
const mcpJs = path.join(repo, 'packages/mcp-server/dist/index.js');
for (const p of [cliJs, mcpJs]) if (!existsSync(p)) throw new Error(`gen-demo: missing ${p}; build the packages first`);

const work = mkdtempSync(path.join(tmpdir(), 'astra-site-demo-'));
cpSync(path.join(site, 'demo-src'), work, { recursive: true });
const markdown = readFileSync(path.join(work, 'board-report.md'), 'utf8');
const built = path.join(work, 'atlas-board-report.docx');
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, 12);
const cli = (...a) => execFileSync('node', [cliJs, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

const mcp = startMcp(mcpJs, work);
await mcp.init();

const FAKE_SESSION = 'sess_7c1e4a52-2f3b-4d0e-9a61-0c5b8e2d4f17';
const steps = [];
let sessionId = null;

function parse(r) {
  const texts = (r.content ?? []).filter((c) => c.type === 'text').map((c) => c.text);
  const images = (r.content ?? []).filter((c) => c.type === 'image').length;
  let body;
  try { body = JSON.parse(texts[0]); } catch { body = { raw: texts[0] }; }
  return { body, images, isError: Boolean(r.isError) };
}
const trimBig = (v) => JSON.parse(JSON.stringify(v, (k, x) => (Array.isArray(x) && x.length > 6 && x.every((y) => typeof y === 'string') ? [...x.slice(0, 3), `…${x.length - 3} more`] : typeof x === 'string' && x.length > 400 && !/toonText|markdown/.test(k) ? `[${x.length} characters omitted]` : x)));

async function step(group, title, tool, args, { keep, note, argsView } = {}) {
  const callArgs = { ...args };
  if (sessionId && 'sessionId' in callArgs) callArgs.sessionId = sessionId;
  const r = await mcp.call(tool, callArgs);
  const { body, images, isError } = parse(r);
  let shown = keep ? Object.fromEntries(keep.filter((k) => k in body).map((k) => [k, body[k]])) : body;
  if (images) shown = { ...shown, images: `${images} page image(s) returned` };
  steps.push({
    group, title, tool,
    args: trimBig(argsView ?? args),
    ok: !isError && body.ok !== false,
    response: trimBig(shown),
    trimmed: Boolean(keep) || images > 0,
    note: note ?? null,
  });
  return body;
}

// ---- Build: compose a designed report from one Markdown call ------------------------------
const created = await step('build', 'Create an empty document', 'new_document', { outPath: built, template: 'blank', styleGuide: 'atlas-style.md' }, { keep: ['ok', 'sessionId', 'revision'] });
sessionId = created.sessionId;
const composed = await step('build', 'Compose the whole report from Markdown', 'compose_document',
  { sessionId, markdown, allowedDir: work, styleGuide: 'atlas-style.md' },
  { keep: ['ok', 'opCount', 'appliedCount', 'revision', 'createdNodeIds'], argsView: { sessionId, markdown: `# Atlas Robotics: Q3 2026 Board Report\n\n## 1. Executive summary\n…(${markdown.split('\n').length} lines of Markdown: headings, a table, three charts, callouts, a footnote, a link, a code block)`, allowedDir: '/path/to/documents', styleGuide: 'atlas-style.md' },
    note: 'One call. Charts come from small JSON files, tables from Markdown, callouts from > [!TIP] blocks.' });
if (composed.ok === false) throw new Error('gen-demo: compose failed: ' + JSON.stringify(composed));
await step('build', 'Check the package against the schema', 'validate_document', { sessionId }, { keep: ['ok', 'valid', 'errors', 'warnings'] });
await step('build', 'Look at the pages it made', 'visual_inspect', { sessionId, pages: [1] }, { keep: ['ok', 'pages', 'tokens', 'pageCount'], note: 'The agent gets a rendered page back and can check its own layout.' });
await step('build', 'Save', 'save_document', { sessionId, outPath: built }, { keep: ['ok', 'revision', 'dirty', 'path'] });
await mcp.call('close_document', { sessionId });

// ---- Edit: read it as TOON, then change it in one batch ------------------------------------
const opened = await step('edit', 'Re-open the saved report', 'open_document', { path: built }, { keep: ['ok', 'sessionId', 'revision'] });
sessionId = opened.sessionId;
const inspected = await step('edit', 'Read it as compact TOON', 'inspect_document', { sessionId, fidelity: 'compact', maxTextLength: 60 }, { keep: ['ok', 'revision', 'fidelity', 'toonText'] });
const rows = inspected.toonText.split('\n').filter((l) => /^(\w{6,10}|t_\d+|_bk_\w+) \|/.test(l) && !l.startsWith('ID ')).map((l) => l.split(' | ').map((c) => c.trim()));
const rowWith = (needle) => rows.find((r) => r.slice(5).join(' ').includes(needle));
const tableRow = rows.find((r) => /^table:6x4/.test(r[4] ?? ''));
const lastRisk = rowWith('Currency exposure');
if (!tableRow || !lastRisk) throw new Error('gen-demo: expected table and risk rows in the TOON output');
const editOps = [
  { action: 'table', operation: 'updateCell', target: tableRow[0], rowIndex: 4, columnIndex: 2, text: '18' },
  { action: 'callout', anchor: lastRisk[0], position: 'after', theme: 'rose', title: 'Added by the agent', text: 'Hedging policy review is scheduled for the November board meeting.' },
];
const edit = await step('edit', 'Change a table cell and add a callout', 'execute_batch', { sessionId, operations: editOps }, { keep: ['ok', 'appliedCount', 'revision', 'results'] });
if (edit.ok === false) throw new Error('gen-demo: edit batch failed: ' + JSON.stringify(edit));
const editedPath = path.join(work, 'atlas-board-report.edited.docx');
await step('edit', 'Save', 'save_document', { sessionId, outPath: editedPath }, { keep: ['ok', 'revision', 'dirty'] });
await mcp.call('close_document', { sessionId });

// ---- Refuse: an invalid value is stopped at save -------------------------------------------
sessionId = parse(await mcp.call('open_document', { path: built })).body.sessionId;
const target = rowWith('Revenue reached')?.[0];
if (!target) throw new Error('gen-demo: could not find the summary paragraph');
const blockedPath = path.join(work, 'blocked.docx');
await step('refuse', 'The agent sets a colour that is not a colour', 'execute_batch', { sessionId, operations: [{ action: 'style', target, color: 'not-a-color' }] }, { keep: ['ok', 'appliedCount', 'revision'], note: 'The edit is accepted into the working copy. The check happens at save.' });
const blocked = await step('refuse', 'Save is refused by the validator', 'save_document', { sessionId, outPath: blockedPath }, { note: 'Nothing was written to disk.' });
if (blocked.ok !== false || existsSync(blockedPath)) throw new Error('gen-demo: expected the save to be blocked and no file written');
await step('refuse', 'The agent fixes it from the remedy', 'execute_batch', { sessionId, operations: [{ action: 'style', target, color: '1E3A8A' }] }, { keep: ['ok', 'appliedCount', 'revision'] });
const fixedPath = path.join(work, 'fixed.docx');
await step('refuse', 'Save succeeds', 'save_document', { sessionId, outPath: fixedPath }, { keep: ['ok', 'revision', 'dirty'] });
await mcp.call('close_document', { sessionId });

// ---- Rollback: all or nothing ----------------------------------------------------------------
const beforeHash = sha(built);
sessionId = parse(await mcp.call('open_document', { path: built })).body.sessionId;
await step('rollback', 'A batch where the third edit is wrong', 'execute_batch', {
  sessionId, rollbackOnError: true,
  operations: [
    { action: 'table', operation: 'updateCell', target: tableRow[0], rowIndex: 1, columnIndex: 2, text: '$99M' },
    { action: 'style', target, bold: true },
    { action: 'replace', target: 'DEADBEEF', text: 'This node does not exist.' },
  ],
});
await step('rollback', 'Check the document', 'inspect_document', { sessionId, fidelity: 'compact', maxTextLength: 40 }, { keep: ['ok', 'revision', 'dirty'], note: 'Revision is unchanged and the document is clean: edits 1 and 2 were rolled back too.' });
await mcp.call('close_document', { sessionId });
mcp.close();
if (sha(built) !== beforeHash) throw new Error('gen-demo: the built document changed');

// ---- Render pages ------------------------------------------------------------------------------
const out = path.join(site, 'public', 'demo');
mkdirSync(out, { recursive: true });
const render = (docx, page, name) => {
  const tmp = path.join(work, `${name}-full.png`);
  cli('visual', docx, '--page', String(page), '--out', tmp, '--force');
  const digest = sha(tmp);
  if (render.last === digest) throw new Error('past the last page');
  render.last = digest;
  execFileSync('magick', [tmp, '-trim', '+repage', '-bordercolor', 'white', '-border', '40', '-resize', '800x', '-strip', '-quality', '86', path.join(out, `${name}.webp`)]);
};
const pages = [];
for (let p = 1; p <= 4; p++) {
  try { render(built, p, `report-p${p}`); pages.push(`/demo/report-p${p}.webp`); } catch { break; }
}
render.last = null;
render(editedPath, 3, 'report-edited-p3');

// ---- Read cost of the whole built report: raw XML versus the TOON rows ----------------------------
const { createRequire } = await import('node:module');
const AdmZip = createRequire(path.join(repo, 'package.json'))('adm-zip');
const zip = new AdmZip(built);
const rawXml = zip.readAsText('word/document.xml');
const toonFull = cli('inspect', built, '--fidelity', 'compact').split('\n');
const toonCut = toonFull.findIndex((l) => l.startsWith('rows='));
const toonText = toonFull.slice(0, toonCut).filter((l) => !l.startsWith('> fidelity')).join('\n');
const est = (n) => Math.ceil(n / 3.8);
const readCost = {
  parts: zip.getEntries().filter((e) => !e.isDirectory).length,
  rawXmlChars: rawXml.length, rawXmlTokensEst: est(rawXml.length),
  toonChars: toonText.length, toonTokensEst: est(toonText.length),
  toonRows: toonText.split('\n').length - 2,
  toonSample: toonText.split('\n').slice(0, 12).map((l) => (l.length > 150 ? l.slice(0, 147) + '...' : l)).join('\n'),
};

const session = {
  source: { commit: execFileSync('git', ['-C', repo, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim(), server: JSON.parse(readFileSync(path.join(repo, 'packages/mcp-server/package.json'), 'utf8')).version },
  document: { title: 'Atlas Robotics: Q3 2026 Board Report', markdownLines: markdown.split('\n').length, pages: pages.length, hashBefore: beforeHash, hashAfterRefusal: sha(built), refusalWroteFile: false },
  steps,
  readCost,
  images: { pages, edited: '/demo/report-edited-p3.webp' },
  tokenNote: 'Token counts are estimates: characters divided by 3.8.',
};
writeFileSync(path.join(site, 'src', 'data', 'demo-session.json'), JSON.stringify(session, null, 2).replace(/sess_[0-9a-f-]{36}/g, FAKE_SESSION).replaceAll(work, '/path/to/documents') + '\n');
console.log(`demo-session: ${steps.length} steps (${steps.filter((s) => !s.ok).length} refusals), ${pages.length} pages rendered`);
