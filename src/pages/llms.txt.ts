import type { APIRoute } from 'astro';
import facts from '../data/site-facts.json';
import { toolSummaries } from '../data/tool-summaries';
import { site } from '../site.config';

const u = (p: string) => new URL(p, site.url).href;

export const GET: APIRoute = () => {
  const mcp = facts.packages['mcp-server'];
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.name} lets an AI agent read, edit, validate and undo changes to Word (.docx) files through typed operations, without writing XML. It ships as an MCP server, a command-line tool and a TypeScript engine. Source-available under the Business Source License 1.1 (free production use for individuals, schools, non-profits, public bodies and small businesses), made by ${site.brand}.`,
    '',
    '## Connect',
    `- Run the MCP server: \`npx -y ${mcp.name} --allowed-dir <folder>\` (stdio, Node ${mcp.node}).`,
    `- Setup for Claude Desktop, Cursor, Windsurf, Claude Code and others: ${u('/connect')}`,
    `- Machine-readable tool catalogue: ${u('/tools.json')}`,
    '',
    `## Tools (${facts.mcp.count})`,
    ...facts.mcp.tools.map((t) => `- ${t.name}: ${toolSummaries[t.name]}`),
    '',
    `## Batch operations (${facts.operations.count})`,
    facts.operations.actions.join(', '),
    '',
    '## How it behaves',
    '- Documents are read as compact rows with stable node IDs; edits address those IDs.',
    '- execute_batch is all or nothing: a failed batch leaves the document unchanged.',
    '- save_document validates the package and refuses to write a broken one, returning a remedy.',
    '- Reads and writes are limited to the folders passed with --allowed-dir.',
    '',
    '## Status',
    `- MCP server ${mcp.version}, CLI ${facts.packages.cli.version}, engine ${facts.packages.engine.version}.`,
    '',
    '## More',
    `- What happens between a request and a saved file (read, batch, validate, history, sandbox): ${u('/how-it-works')}`,
    `- Source and issues: ${site.github.url}`,
    `- Contact, licensing and security reports: ${u('/contact')}`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
