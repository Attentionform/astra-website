import { useEffect, useRef, useState } from 'react';

const docs = [
  { id: 'atlas', tab: 'Board report', pages: 4, line: 'A Markdown file becomes a board-ready report in one call.', feats: ['Cover page', 'Styled tables', 'Native charts', 'Callouts', 'Footnotes', 'Footers'] },
  { id: 'meridian', tab: 'Launch brief', pages: 4, line: 'Timelines, budgets and decisions, charted and on brand.', feats: ['Area, bar and column charts', 'Brand palette', 'Numbered risks', 'Code block'] },
  { id: 'hale', tab: 'Contract review', pages: 1, line: 'Redlines down to the word. Comments from every reviewer.', feats: ['Tracked changes', 'Margin comments', 'Authors and dates', 'Accept or reject'] },
  { id: 'northwind', tab: 'Technical paper', pages: 3, line: 'Abstract, results, figures and footnotes, laid out properly.', feats: ['Line and scatter charts', 'Results table', 'Footnotes', 'Code block'] },
] as const;

export default function Gallery() {
  const [d, setD] = useState(0);
  const [pg, setPg] = useState(() => (docs[0].pages > 1 ? 1 : 0));
  const [zoom, setZoom] = useState(false);
  const doc = docs[d];
  const tilt = useRef<HTMLDivElement>(null);
  const pick = (i: number) => { setD(i); setPg(docs[i].pages > 1 ? 1 : 0); };
  const src = `/showcase/${doc.id}-p${pg + 1}.webp`;

  useEffect(() => {
    if (!zoom) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setZoom(false);
    addEventListener('keydown', k); document.body.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [zoom]);

  const onMove = (e: React.PointerEvent) => {
    const el = tilt.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--ry', `${(((e.clientX - r.left) / r.width) - 0.5) * 9}deg`);
    el.style.setProperty('--rx', `${-(((e.clientY - r.top) / r.height) - 0.5) * 7}deg`);
  };

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <div role="group" aria-label="Choose a document" className="flex flex-wrap gap-2">
          {docs.map((x, i) => (
            <button key={x.id} type="button" aria-pressed={i === d} onClick={() => pick(i)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${i === d ? 'border-transparent text-[#0b0720]' : 'border-line-strong text-muted hover:text-fg'}`} style={i === d ? { background: 'linear-gradient(100deg,#c4b5fd,#67e8f9)' } : undefined}>{x.tab}</button>
          ))}
        </div>
        <h3 key={doc.id} className="mt-8 text-3xl font-bold leading-tight tracking-tight sm:text-4xl" style={{ animation: 'rise .6s both' }}>{doc.line}</h3>
        <ul className="mt-6 flex flex-wrap gap-2">
          {doc.feats.map((f, i) => (<li key={doc.id + f} className="chip" style={{ animation: `rise .5s ${i * 70}ms both` }}>{f}</li>))}
        </ul>
        <p className="mt-6 text-sm text-subtle">Built by an agent with the real server and rendered from the saved file. Click a page to zoom in.</p>
        {doc.pages > 1 && (
          <div role="group" className="mt-6 flex items-center gap-2" aria-label="Pages">
            {Array.from({ length: doc.pages }).map((_, i) => (
              <button key={i} type="button" onClick={() => setPg(i)} aria-label={`Page ${i + 1}`} aria-current={i === pg ? 'true' : undefined} className={`h-14 w-11 overflow-hidden rounded border transition-all ${i === pg ? 'border-cyan scale-110 shadow-[0_0_18px_rgb(34_211_238/.5)]' : 'border-line-strong opacity-60 hover:opacity-100'}`}>
                <img src={`/showcase/${doc.id}-p${i + 1}.webp`} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div onPointerMove={onMove} onPointerLeave={() => { tilt.current?.style.setProperty('--rx', '0deg'); tilt.current?.style.setProperty('--ry', '0deg'); }} className="relative mx-auto w-full max-w-[34rem]">
        <div className="pointer-events-none absolute -inset-x-3 -inset-y-10 -z-10 sm:-inset-10 rounded-full opacity-60 blur-3xl" style={{ background: 'radial-gradient(circle, rgb(139 92 246 / .45), rgb(34 211 238 / .15) 55%, transparent 70%)' }} />
        <div ref={tilt} style={{ transform: 'perspective(1600px) rotateY(var(--ry,0deg)) rotateX(var(--rx,0deg))', transition: 'transform .3s ease-out' }}>
          <button type="button" onClick={() => setZoom(true)} aria-label="Zoom in on this page" className="paper-shadow block w-full cursor-zoom-in overflow-hidden rounded-lg bg-white">
            <img key={src} src={src} alt={`${doc.tab}, page ${pg + 1}`} width={1240} height={1605} className="block w-full" style={{ animation: 'rise .55s both' }} />
          </button>
        </div>
      </div>

      {zoom && (
        <div className="fixed inset-0 z-[70] overflow-auto bg-black/85 p-4 backdrop-blur-md" onClick={() => setZoom(false)} role="dialog" aria-modal="true" aria-label="Page, full size">
          <button type="button" autoFocus className="btn fixed right-4 top-4 !min-h-9" onClick={(e) => { e.stopPropagation(); setZoom(false); }}>Close</button>
          <img src={src} alt={`${doc.tab}, page ${pg + 1}, full size`} className="mx-auto my-6 block w-full max-w-4xl rounded bg-white shadow-2xl" />
        </div>
      )}
    </div>
  );
}
