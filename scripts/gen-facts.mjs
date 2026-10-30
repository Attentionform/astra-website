// Generates src/data/site-facts.json from the ASTra repository.
// Every number, name and list the site shows comes from this file.
// Usage: node scripts/gen-facts.mjs   (ASTRA_REPO=/path/to/ASTra to override)
import { spawn, execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(process.env.ASTRA_REPO ?? path.join(here, '..', '..'));
const out = path.join(here, '..', 'src', 'data', 'site-facts.json');

const need = (p) => {
  if (!existsSync(p)) throw new Error(`gen-facts: missing ${p}. Build the packages first (npm run build:packages in ${repo}).`);
  return p;
};
const readJson = (p) => JSON.parse(readFileSync(need(p), 'utf8'));

// 1. Packages ---------------------------------------------------------------
const pkgDirs = { engine: 'engine', 'mcp-server': 'mcp-server', cli: 'cli', 'ooxml-validator': 'ooxml-validator' };
const packages = Object.fromEntries(
  Object.entries(pkgDirs).map(([key, dir]) => {
    const p = readJson(path.join(repo, 'packages', dir, 'package.json'));
    return [key, { name: p.name, version: p.version, license: p.license, bin: p.bin ?? null, node: p.engines?.node ?? null }];
  }),
);

// 2. MCP tools, live from the built server over stdio -----------------------
function listMcpTools() {
  const server = need(path.join(repo, 'packages/mcp-server/dist/index.js'));
  return new Promise((resolve, reject) => {
    const child = spawn('node', [server, '--allowed-dir', repo], { stdio: ['pipe', 'pipe', 'ignore'] });
    const timer = setTimeout(() => { child.kill(); reject(new Error('gen-facts: MCP tools/list timed out')); }, 20000);
    let buf = '';
    const send = (o) => child.stdin.write(JSON.stringify(o) + '\n');
    child.stdout.on('data', (d) => {
      buf += d;
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line) continue;
        const msg = JSON.parse(line);
        if (msg.id === 1) {
          send({ jsonrpc: '2.0', method: 'notifications/initialized' });
          send({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
        } else if (msg.id === 2) {
          clearTimeout(timer);
          child.kill();
          resolve(msg.result.tools);
        }
      }
    });
    send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'site-facts', version: '0' } } });
  });
}
const rawTools = await listMcpTools();
const firstSentence = (s) => (s.replace(/\s+/g, ' ').match(/^.*?[.!?](?=\s|$)/)?.[0] ?? s).trim();
const typeOf = (s) => (Array.isArray(s.type) ? s.type.join(' | ') : s.type) ?? (s.enum ? 'enum' : s.anyOf ? s.anyOf.map(typeOf).join(' | ') : 'any');
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
const paramsOf = (schema) => {
  const required = new Set(schema?.required ?? []);
  return Object.entries(schema?.properties ?? {}).map(([name, s]) => ({
    name, type: typeOf(s), required: required.has(name), description: clip(firstSentence(s.description ?? ''), 180),
  }));
};
const tools = rawTools.map((t) => ({ name: t.name, summary: firstSentence(t.description ?? ''), description: t.description ?? '', params: paramsOf(t.inputSchema) }));

// 3. Operation actions, read from the execute_batch input schema ------------
const batch = rawTools.find((t) => t.name === 'execute_batch');
const schemaText = JSON.stringify(batch.inputSchema);
const actions = [...new Set([...schemaText.matchAll(/"action":\{"(?:type":"string",")?const":"([A-Za-z]+)"/g)].map((m) => m[1]))];
if (actions.length === 0) throw new Error('gen-facts: found no operation actions in the execute_batch schema');

// 4. CLI commands, parsed from `astra --help` --------------------------------
const cliJs = need(path.join(repo, 'packages/cli/dist/cli.js'));
const help = execFileSync('node', [cliJs, '--help'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const commandBlock = help.split(/\n\s*\n/).find((b) => b.startsWith('Commands')) ?? '';
const cliCommands = [...commandBlock.matchAll(/^ {2}([a-z-]+)\s/gm)].map((m) => m[1]);
const cliUsage = Object.fromEntries([...commandBlock.matchAll(/^ {2}([a-z-]+)\s+(.*)$/gm)].map((m) => [m[1], `${m[1]} ${m[2]}`.trim()]));

// 5. Template gallery, validated by the real CLI ----------------------------
const galleryDir = path.join(repo, 'test-gallery');
const gallery = readdirSync(need(galleryDir))
  .filter((f) => /^T\d.*\.docx$/.test(f))
  .sort()
  .map((file) => {
    let ok = false;
    try {
      const o = execFileSync('node', [cliJs, '--json', 'validate', path.join(galleryDir, file)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      ok = JSON.parse(o).ok === true;
    } catch (e) {
      try { ok = JSON.parse(String(e.stdout)).ok === true; } catch { ok = false; }
    }
    return { file, ok };
  });

// 6. Assemble ----------------------------------------------------------------
const git = (...a) => { try { return execFileSync('git', ['-C', repo, ...a], { encoding: 'utf8' }).trim(); } catch { return null; } };
const facts = {
  source: { commit: git('rev-parse', '--short', 'HEAD'), note: 'Generated by scripts/gen-facts.mjs. Do not edit by hand.' },
  packages,
  mcp: { count: tools.length, tools },
  operations: { count: actions.length, actions },
  cli: { count: cliCommands.length, commands: cliCommands, usage: cliUsage },
  gallery: { total: gallery.length, valid: gallery.filter((g) => g.ok).length, files: gallery },
};
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(facts, null, 2) + '\n');
console.log(`site-facts: ${tools.length} MCP tools, ${actions.length} operations, ${cliCommands.length} CLI commands, gallery ${facts.gallery.valid}/${facts.gallery.total} valid, repo ${facts.source.commit}`);
