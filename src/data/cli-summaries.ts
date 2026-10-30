// What each `astra` command is for, in one line, with an example. The command
// names are checked against the CLI's own help at build time (docs/cli page).
export const cliSummaries: Record<string, { does: string; example: string }> = {
  inspect: { does: 'Print the document as a compact outline with node IDs.', example: 'astra inspect report.docx --fidelity compact' },
  validate: { does: 'Check the file against the Word schema without changing it. Exit code 1 means it is invalid.', example: 'astra validate report.docx --json' },
  sanitize: { does: 'Remove author names, comments, revision history and other metadata, and optionally redact personal data.', example: 'astra sanitize draft.docx clean.docx --client-safe' },
  batch: { does: 'Apply edits from a JSON file, standard input, or a quick --append. All edits apply or none do.', example: 'astra batch report.docx ops.json --out updated.docx' },
  normalize: { does: 'Repair known structural problems and tidy redundant formatting.', example: 'astra normalize old.docx --out clean.docx' },
  export: { does: 'Export to HTML, Markdown or PDF (PDF needs LibreOffice).', example: 'astra export report.docx --format markdown -o report.md' },
  search: { does: 'Find text and print the IDs of the nodes that contain it. Case is ignored.', example: 'astra search report.docx "milestones"' },
  create: { does: 'Create a new document from a template, or from Markdown.', example: 'astra create report.docx --template report' },
  import: { does: 'Convert a Markdown file into a .docx.', example: 'astra import notes.md -o notes.docx' },
  stats: { does: 'Count words, paragraphs, tables and pages.', example: 'astra stats report.docx' },
  visual: { does: 'Render one page to a PNG or JPEG image (needs LibreOffice).', example: 'astra visual report.docx --page 1 --out page1.png' },
  history: { does: 'List the saved revisions of a document, newest first.', example: 'astra history report.docx' },
  'preview-revert': { does: 'Show what going back a number of revisions would do, without changing the file.', example: 'astra preview-revert report.docx --steps 1' },
  revert: { does: 'Go back a number of revisions. The revert is recorded as a new revision.', example: 'astra revert report.docx --steps 1' },
  redo: { does: 'Re-apply the revision that the last revert replaced.', example: 'astra redo report.docx' },
};
