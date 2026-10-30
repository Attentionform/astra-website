import type { APIRoute } from 'astro';
import facts from '../data/site-facts.json';
import { toolSummaries } from '../data/tool-summaries';
import { site } from '../site.config';

// Machine-readable catalogue of what the MCP server offers, generated from the
// same facts file as the pages.
export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        name: site.name,
        publisher: site.brand,
        mcpServer: { package: facts.packages['mcp-server'].name, version: facts.packages['mcp-server'].version, command: `npx -y ${facts.packages['mcp-server'].name} --allowed-dir <folder>`, transport: 'stdio' },
        tools: facts.mcp.tools.map((t) => ({ name: t.name, summary: toolSummaries[t.name] })),
        batchOperations: facts.operations.actions,
        cliCommands: facts.cli.commands,
        source: site.github.url,
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  );
