// Routes that exist. Add an entry here in the same commit that adds the page.
export const nav = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/docs', label: 'Docs' },
  { href: '/#gallery', label: 'Gallery' },
  { href: '/#features', label: 'Features' },
  { href: '/connect', label: 'Connect' },
] as const;

export const footerProduct: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/connect', label: 'Connect' },
  { href: '/docs', label: 'Documentation' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/#features', label: 'Features' },
];
