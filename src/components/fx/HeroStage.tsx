import { useRef } from 'react';
import { useInView, useTicker } from './hooks';

type Tag = { label: string; id: string; y: number; x?: number };
const pages: { src: string; alt: string; tags: Tag[] }[] = [
  { src: '/showcase/atlas-p2.webp', alt: 'A board report page with a table, a stacked column chart and a callout', tags: [{ label: 'Heading2', id: 'md_0004', y: 31 }, { label: 'callout', id: 't_001', y: 25 }, { label: 'table', id: 't_002', y: 44 }, { label: 'chart', id: 'c_001', y: 68 }] },
  { src: '/showcase/meridian-p2.webp', alt: 'A launch brief page with a timeline table and an area chart', tags: [{ label: 'Heading2', id: 'md_0004', y: 33 }, { label: 'callout', id: 't_001', y: 25 }, { label: 'table', id: 't_002', y: 42 }, { label: 'chart', id: 'c_001', y: 66 }] },
];
const log = [
  ['open_document', 'Session open'],
  ['compose_document', 'Markdown in. A styled report out.'],
  ['validate_document', 'Package is valid'],
  ['visual_inspect', 'The agent sees its own pages'],
  ['save_document', 'Saved. Revision recorded.'],
] as const;

const STEPS = 16;

export default function HeroStage() {
  const [ref, inView] = useInView<HTMLDivElement>(0.2);
  const [t, cycle] = useTicker(STEPS, 900, inView);
  const p = pages[cycle % pages.length];

  const reveal = t < 2 ? 0 : t < 7 ? (t - 1) / 6 : 1; // 0..1 of the page height
  const saved = t >= 9;
  const tilt = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = tilt.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`);
  };
  const onLeave = () => { tilt.current?.style.setProperty('--ry', '0deg'); tilt.current?.style.setProperty('--rx', '0deg'); };

  return (
    <div ref={ref} className="relative mx-auto grid w-full max-w-5xl items-stretch gap-5 lg:grid-cols-[1fr_27.5rem]" onPointerMove={onMove} onPointerLeave={onLeave}>
      {/* Agent log */}
      <div className="glass glass-glow flex flex-col p-5 text-left">
        <div className="flex items-center gap-2 text-xs text-subtle">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 font-mono">agent · astra-mcp</span>
        </div>
        <p className="mt-5 font-mono text-[0.8rem] leading-relaxed text-muted">
          <span className="text-violet">you</span> Build the Q3 board report from the notes in <span className="text-fg">/docs</span>.
        </p>
        <ul className="mt-4 space-y-3">
          {log.map(([tool, msg], i) => {
            const on = t >= i * 1.6 + 1;
            const done = t >= i * 1.6 + 2;
            return (
              <li key={tool} className="font-mono text-[0.8rem] transition-all duration-500" style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(10px)' }}>
                <div className="flex items-center gap-2">
                  <span className={done ? 'text-pass' : 'text-cyan pulse-dot'}>{done ? '✓' : '●'}</span>
                  <span className="text-fg">{tool}</span>
                </div>
                <div className="pl-5 text-[0.74rem] text-subtle">{done ? msg : '…'}</div>
              </li>
            );
          })}
        </ul>
        <div className="mt-auto pt-6">
          <div className={`rounded-xl border px-3 py-2 text-xs transition-all duration-700 ${saved ? 'border-pass/50 bg-pass/10 text-pass' : 'border-line text-subtle'}`}>
            {saved ? 'Valid. Nothing was left half-written.' : 'Working. Every step is checked before it counts.'}
          </div>
        </div>
      </div>

      {/* The document */}
      <div ref={tilt} className="relative" style={{ transform: 'perspective(1500px) rotateY(var(--ry,0deg)) rotateX(var(--rx,0deg))', transition: 'transform .35s ease-out', transformStyle: 'preserve-3d' }}>
        <div className="paper-shadow relative mx-auto aspect-[1240/1605] w-full overflow-hidden rounded-lg bg-white">
          <img key={p.src} src={p.src} alt={p.alt} width={1240} height={1605} className="absolute left-0 top-0 block w-full" style={{ clipPath: `inset(0 0 ${(1 - reveal) * 100}% 0)`, transition: 'clip-path 1.2s linear' }} />
          {/* build beam */}
          <div className="pointer-events-none absolute inset-x-0 h-24" style={{ top: `${reveal * 100 - 8}%`, opacity: reveal > 0 && reveal < 1 ? 1 : 0, background: 'linear-gradient(180deg, transparent, rgb(139 92 246 / .35), rgb(34 211 238 / .55))', transition: 'top 1.2s linear, opacity .4s' }} />
          {/* verified stamp */}
          <div className={`absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-pass/60 bg-[#04170f]/90 px-3 py-1 font-mono text-[0.7rem] text-pass transition-all duration-700 ${saved ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
            <span>✓</span> valid
          </div>
        </div>
        {/* node ID tags, positioned against the visible window of the page */}
        {p.tags.map((tag, i) => {
          const shown = reveal * 100 > tag.y - 6 && t >= 4;
          return (
            <div key={tag.id} className="pointer-events-none absolute left-0 hidden lg:block" style={{ top: `${tag.y}%`, transform: `translateX(-22%) translateY(${shown ? 0 : 8}px)`, opacity: shown && !saved ? 1 : shown ? 0.85 : 0, transition: 'all .6s cubic-bezier(.2,.7,.2,1)', transitionDelay: `${i * 80}ms` }}>
              <span className="chip border-violet/60 bg-[#120b2b]/90 text-[0.68rem] text-[#ddd6fe] shadow-lg shadow-violet/30">{tag.label}<b className="font-medium text-cyan">{tag.id}</b></span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
