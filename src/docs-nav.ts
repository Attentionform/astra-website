// Pages of the /docs section, in reading order. Add an entry here in the same
// commit that adds the page.
export const docsPages = [
  { href: '/docs/quickstart', label: 'Quickstart', blurb: 'Make your first safe edit in a few minutes.' },
  { href: '/docs/concepts', label: 'Core concepts', blurb: 'Sessions, node IDs, the outline, batches and validation.' },
  { href: '/docs/mcp-tools', label: 'MCP tools', blurb: 'Every tool your agent gets, with its parameters.' },
  { href: '/docs/operations', label: 'Operations', blurb: 'What execute_batch can change in a document.' },
  { href: '/docs/page-layout', label: 'Page layout', blurb: 'Sections, orientation, headers and footers, columns, borders and lists.' },
  { href: '/docs/cli', label: 'Command line', blurb: 'Every astra command, with usage and an example.' },
  { href: '/docs/recipes', label: 'Recipes', blurb: 'Copy-paste examples for common jobs.' },
  { href: '/docs/errors', label: 'Errors', blurb: 'What each error code means and how to fix it.' },
  { href: '/docs/security', label: 'Security and privacy', blurb: 'What ASTra restricts, removes and sends.' },
  { href: '/docs/faq', label: 'FAQ', blurb: 'Short answers to common questions.' },
] as const;
