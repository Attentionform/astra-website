// The page's route as a visitor types it: "/connect", "/docs/security", "/".
// The site is built with `build.format: 'file'`, so while building, Astro reports "/connect.html" and
// "/index.html"; the dev server reports "/connect". Both give the same answer here.
export function routePath(pathname: string): string {
  return pathname.replace(/(?:\/index)?\.html$/, '').replace(/\/$/, '') || '/';
}
