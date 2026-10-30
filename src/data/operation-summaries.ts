// Human-written descriptions of the operations `execute_batch` accepts, grouped
// as in the engine README. The keys are checked against the live operation list
// at build time (see the operations docs page), so a new or renamed operation
// fails the build instead of going stale.
export const operationGroups: ReadonlyArray<{ title: string; ops: Record<string, string> }> = [
  {
    title: 'Content',
    ops: {
      insert: 'Add a paragraph, heading, table, image, chart, divider or page break before or after a node.',
      replace: 'Replace the text of a node while keeping its style.',
      delete: 'Remove a node.',
      move: 'Move a node to a new position.',
    },
  },
  {
    title: 'Formatting',
    ops: {
      style: 'Change bold, italic, underline, colour, size and alignment of a node.',
      clearFormat: 'Remove direct formatting so a node follows its style again.',
      namedStyle: 'Apply a named Word style such as Heading1 to a node.',
    },
  },
  {
    title: 'Tables and page structure',
    ops: {
      table: 'Edit a table: cells, rows, columns, merging and splitting, borders, shading, widths, alignment and repeating header rows.',
      section: 'Set the number of columns in a section, or split and merge sections.',
      pageSetup: 'Set paper size, orientation, margins and columns.',
      pageBorder: 'Add a border around the page.',
      coverPage: 'Add a cover page.',
    },
  },
  {
    title: 'Rich elements',
    ops: {
      chart: 'Insert or update a native Word chart, for example column, line or combination charts.',
      image: 'Insert an image, resize it, and set its alt text.',
      equation: 'Insert an equation as native Word math.',
      callout: 'Insert a highlighted note box.',
      field: 'Insert a table of contents, page number or word count, or update fields.',
      list: 'Create a numbered or bulleted list, continue one, change a level, or remove list formatting.',
    },
  },
  {
    title: 'References and annotations',
    ops: {
      footnote: 'Add a footnote.',
      endnote: 'Add an endnote.',
      hyperlink: 'Add a link to a web address or a bookmark.',
      bookmark: 'Add a bookmark.',
      comment: 'Add a comment, or reply to one.',
      headerFooter: 'Set or remove header and footer content.',
      watermark: 'Add a text watermark.',
    },
  },
  {
    title: 'Revisions and properties',
    ops: {
      trackedChange: 'Accept or reject all tracked changes, or insert or delete text as a tracked change.',
      metadata: 'Set document properties such as title, author, subject and keywords.',
    },
  },
];
