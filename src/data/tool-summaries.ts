// One-line, human-written summaries of the MCP tools. The names are checked
// against the server's own tool list at build time (see connect.astro), so a
// renamed or added tool fails the build instead of going stale.
export const toolSummaries: Record<string, string> = {
  open_document: 'Open a .docx into a session and get a session ID.',
  inspect_document: 'Read the document as compact rows with node IDs and styles.',
  search_content: 'Find text and get back the node IDs that contain it.',
  execute_batch: 'Apply up to 500 typed operations, all or nothing.',
  save_document: 'Validate, then write the file. A broken package is refused with a remedy.',
  close_document: 'Release a session.',
  new_document: 'Create a blank report or memo.',
  compose_document: 'Build a whole document from Markdown, with charts, tables and callouts.',
  import_document: 'Bring a Markdown file on disk into the open session.',
  export_document: 'Export to HTML, Markdown or PDF.',
  visual_inspect: 'Render pages so the agent can check its own layout.',
  get_document_history: 'List saved revisions, newest first.',
  preview_revert: 'See what a revert would change before doing it.',
  revert_document: 'Restore an earlier saved revision as a new one.',
  redo_document: 'Re-apply a revision that was reverted.',
  validate_document: 'Run the save-time checks without writing anything.',
  get_stats: 'Word, paragraph, table and image counts, cheaply.',
  sanitize_document: 'Strip authors, comments, revisions, metadata and personal data.',
  normalize_document: 'Repair known structural problems, then re-validate.',
};
