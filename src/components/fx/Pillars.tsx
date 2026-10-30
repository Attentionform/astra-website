import type { ReactNode } from 'react';
import { useInView, useTicker } from './hooks';

/* Shared mini document used by two of the visuals. */
function MiniDoc({ lit = 0, glow = false, label }: { lit?: number; glow?: boolean; label?: string }) {
  return (
    <div className={`relative w-28 shrink-0 rounded-md bg-white p-2.5 transition-shadow duration-700 ${glow ? 'shadow-[0_0_44px_6px_rgb(52_224_161/.45)]' : 'shadow-[0_8px_30px_rgb(0_0_0/.5)]'}`} style={{ aspectRatio: '0.78' }}>
      <div className="h-1.5 w-2/3 rounded bg-slate-800" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="mt-2 h-1 rounded transition-all duration-500" style={{ width: `${90 - i * 8}%`, background: i < lit ? 'linear-gradient(90deg,#8b5cf6,#22d3ee)' : '#cbd5e1' }} />
      ))}
      <div className="mt-3 h-7 rounded bg-slate-200" style={{ boxShadow: lit >= 3 ? 'inset 0 0 0 1.5px #8b5cf6' : undefined }} />
      {label && <div className="absolute -bottom-6 left-0 right-0 text-center font-mono text-[0.65rem] text-subtle">{label}</div>}
    </div>
  );
}

/* 1 · Atomic ------------------------------------------------------------------------------------ */
const ops = ['style heading', 'update table cell', 'insert chart', 'replace text'];
function Atomic() {
  const [ref, on] = useInView<HTMLDivElement>();
  const [t] = useTicker(11, 850, on);
  // where each chip is, and how it looks, at step t
  const state = (i: number) => {
    if (t === 0) return { pos: 'queue', tone: 'idle' };
    if (t < 5) return i < t ? (i === 3 ? { pos: 'gate', tone: 'bad' } : { pos: 'doc', tone: 'ok' }) : { pos: 'queue', tone: 'idle' };
    if (t === 5 || t === 6) return { pos: 'queue', tone: i === 3 ? 'bad' : 'undo' };
    if (t === 7) return { pos: 'queue', tone: i === 3 ? 'fixed' : 'idle' };
    return { pos: 'doc', tone: 'ok' };
  };
  const inDoc = ops.filter((_, i) => state(i).pos === 'doc').length;
  const failed = t >= 4 && t <= 6;
  const tones: Record<string, string> = {
    idle: 'border-line-strong text-muted', ok: 'border-pass/60 bg-pass/10 text-pass', bad: 'border-refuse/70 bg-refuse/10 text-refuse',
    undo: 'border-amber/50 bg-amber/10 text-amber', fixed: 'border-violet/60 bg-violet/15 text-[#ddd6fe]',
  };
  const lit = t >= 8 ? 4 : Math.min(inDoc, 3);
  return (
    <div ref={ref} className="flex h-full items-center justify-between gap-3 px-1">
      <ul className="w-[9.5rem] space-y-2">
        {ops.map((o, i) => {
          const s = state(i);
          return (
            <li key={o} className={`rounded-lg border px-2.5 py-1.5 font-mono text-[0.68rem] transition-all duration-500 ${tones[s.tone]}`} style={{ transform: s.pos === 'queue' ? 'translateX(0)' : s.pos === 'gate' ? 'translateX(22px)' : 'translateX(54px)', opacity: s.pos === 'doc' ? 0.55 : 1 }}>
              {s.tone === 'bad' ? '✕ ' : s.tone === 'undo' ? '↺ ' : s.tone === 'ok' ? '✓ ' : '· '}{s.tone === 'fixed' ? 'replace text (fixed)' : o}
            </li>
          );
        })}
      </ul>
      <div className={`h-28 w-1 shrink-0 rounded-full transition-all duration-500 ${failed ? 'bg-refuse shadow-[0_0_24px_4px_rgb(255_122_89/.6)]' : t >= 9 ? 'bg-pass shadow-[0_0_24px_4px_rgb(52_224_161/.5)]' : 'bg-line-strong'}`} />
      <MiniDoc lit={lit} glow={t >= 9} label={failed ? 'Nothing applied' : t >= 9 ? 'All applied together' : 'Applying…'} />
    </div>
  );
}

/* 2 · History ----------------------------------------------------------------------------------- */
const commits = ['compose', 'edit table', 'add chart', 'bad edit'];
function History() {
  const [ref, on] = useInView<HTMLDivElement>();
  const [t] = useTicker(12, 850, on);
  const n = Math.min(Math.max(t, 2), 4); // commits shown
  const reverted = t >= 7;
  const total = reverted ? 5 : n;
  const x = (i: number) => 28 + i * 56;
  return (
    <div ref={ref} className="flex h-full flex-col justify-center">
      <svg viewBox="0 0 330 120" className="w-full" role="img" aria-label="Commit history with a revert added as a new commit">
        <line x1="28" y1="60" x2={x(Math.max(total - 1, 0))} y2="60" stroke="url(#hg)" strokeWidth="2" style={{ transition: 'all .6s' }} />
        <defs><linearGradient id="hg" x1="0" x2="1"><stop offset="0" stopColor="#8b5cf6" /><stop offset="1" stopColor="#22d3ee" /></linearGradient></defs>
        {/* ghost preview arrow */}
        {t >= 5 && t < 7 && <path d={`M ${x(3)} 44 C ${x(3) - 30} 8, ${x(2) + 30} 8, ${x(2)} 44`} fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeDasharray="5 5" style={{ animation: 'dash 1s linear infinite' }} />}
        {commits.map((c, i) => (
          <g key={c} style={{ opacity: i < n ? 1 : 0, transform: i < n ? 'none' : 'translateY(10px)', transition: 'all .5s' }}>
            <circle cx={x(i)} cy="60" r="9" fill="#0b0c1c" stroke={i === 3 && reverted ? '#ff7a59' : '#a78bfa'} strokeWidth="2" />
            <circle cx={x(i)} cy="60" r="3.5" fill={i === 3 && reverted ? '#ff7a59' : '#22d3ee'} />
            <text x={x(i)} y="92" textAnchor="middle" fill="#a8acc4" fontSize="8.5" fontFamily="JetBrains Mono Variable, monospace">{c}</text>
          </g>
        ))}
        <g style={{ opacity: reverted ? 1 : 0, transition: 'opacity .6s' }}>
          <circle cx={x(4)} cy="60" r="9" fill="#0b0c1c" stroke="#34e0a1" strokeWidth="2" />
          <circle cx={x(4)} cy="60" r="3.5" fill="#34e0a1" />
          <text x={x(4)} y="92" textAnchor="middle" fill="#34e0a1" fontSize="8.5" fontFamily="JetBrains Mono Variable, monospace">revert</text>
        </g>
        {t >= 5 && t < 7 && <text x={x(2) + 28} y="22" textAnchor="middle" fill="#fbbf24" fontSize="8.5" fontFamily="JetBrains Mono Variable, monospace">preview first</text>}
      </svg>
      <p className="mt-1 text-center font-mono text-[0.68rem] text-subtle">{reverted ? 'Back to the good version. History kept every step.' : t >= 5 ? 'Preview what a revert would change…' : 'Every save is a commit.'}</p>
    </div>
  );
}

/* 3 · Safety ------------------------------------------------------------------------------------ */
const scrub = ['author names', 'comments', 'revision marks', 'personal data'];
function Safety() {
  const [ref, on] = useInView<HTMLDivElement>();
  const [t] = useTicker(10, 900, on);
  const bounce = t >= 2 && t <= 3;
  return (
    <div ref={ref} className="grid h-full grid-cols-[1fr_auto] items-center gap-4">
      <div className="relative mx-auto aspect-square w-40">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-violet/60" style={{ animation: 'spin 40s linear infinite' }} />
        <div className="absolute inset-3 rounded-full" style={{ background: 'radial-gradient(circle, rgb(139 92 246 / .22), transparent 70%)' }} />
        <div className="absolute inset-0 flex items-center justify-center font-mono text-[0.68rem] text-[#ddd6fe]">your folder</div>
        {/* an attempt from outside */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 font-mono text-[0.62rem] text-refuse transition-all duration-700" style={{ transform: `translate(${bounce ? '-12px' : t >= 4 ? '-70px' : '-60px'}, -50%)`, opacity: t >= 1 && t <= 4 ? 1 : 0 }}>../secrets ✕</div>
        <div className={`absolute -left-3 top-3 rounded-md border border-refuse/70 bg-[#1c0b07] px-1.5 py-0.5 font-mono text-[0.6rem] text-refuse transition-all duration-500 ${bounce ? 'opacity-100' : 'opacity-0'}`}>E_SANDBOX</div>
      </div>
      <ul className="space-y-1.5 pr-1">
        {scrub.map((s, i) => {
          const gone = t >= 5 + i * 0.7;
          return (
            <li key={s} className="flex items-center gap-2 font-mono text-[0.68rem] transition-all duration-500" style={{ color: gone ? '#34e0a1' : '#a8acc4' }}>
              <span style={{ textDecoration: gone ? 'line-through' : 'none', opacity: gone ? .5 : 1 }}>{s}</span>{gone && <span>✓</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* 4 · Validation -------------------------------------------------------------------------------- */
const checks = ['Structure', 'Relationships', 'Styles', 'Schema'];
function Validation() {
  const [ref, on] = useInView<HTMLDivElement>();
  const [t] = useTicker(12, 850, on);
  const refused = t >= 5 && t <= 7;
  const saved = t >= 9;
  const beam = t < 4 ? (t / 3) * 100 : 100;
  return (
    <div ref={ref} className="flex h-full items-center gap-5">
      <div className="relative w-28 shrink-0 overflow-hidden rounded-md bg-white p-2.5" style={{ aspectRatio: '0.78' }}>
        <div className="h-1.5 w-2/3 rounded bg-slate-800" />
        {[0, 1, 2, 3, 4].map((i) => (<div key={i} className="mt-2 h-1 rounded bg-slate-300" style={{ width: `${92 - i * 7}%` }} />))}
        <div className="mt-3 h-8 rounded bg-slate-200" />
        <div className="absolute inset-x-0 h-10" style={{ top: `${beam - 20}%`, opacity: t < 4 || t === 8 ? 1 : 0, background: 'linear-gradient(180deg, transparent, rgb(34 211 238 / .65))', transition: 'top .85s linear, opacity .3s' }} />
        {refused && <div className="absolute inset-0 grid place-items-center bg-[#2a0d06]/70 font-mono text-[0.62rem] font-bold text-refuse">NOT SAVED</div>}
      </div>
      <div className="min-w-0 flex-1">
        <ul className="space-y-1.5">
          {checks.map((c, i) => (
            <li key={c} className="flex items-center gap-2 font-mono text-[0.7rem]" style={{ color: t > i && !refused ? '#34e0a1' : refused && i === 3 ? '#ff7a59' : '#a8acc4', transition: 'color .4s' }}>
              <span className="w-3">{refused && i === 3 ? '✕' : t > i ? '✓' : '·'}</span>{c}
            </li>
          ))}
        </ul>
        <div className="mt-3 min-h-[3.2rem] rounded-lg border px-2.5 py-1.5 font-mono text-[0.64rem] leading-snug transition-all duration-500" style={{ borderColor: refused ? 'rgb(255 122 89 / .6)' : saved ? 'rgb(52 224 161 / .6)' : 'rgb(255 255 255 / .1)', color: refused ? '#ff9b80' : saved ? '#34e0a1' : '#70758f' }}>
          {refused ? <>refused · nothing written<br />remedy: use a valid value</> : saved ? <>fixed from the remedy<br />saved ✓</> : 'checked before every save'}
        </div>
      </div>
    </div>
  );
}

const cards: { eyebrow: string; title: ReactNode; body: string; visual: ReactNode }[] = [
  { eyebrow: 'Atomic', title: <>A batch lands <span className="grad-text">whole</span>, or it never happened.</>, body: 'An agent sends a whole batch of edits. If one is wrong, every one is undone and the file is untouched. No half-edited documents. Ever.', visual: <Atomic /> },
  { eyebrow: 'History', title: <>Every save is a commit. <span className="grad-text">Time travel</span> included.</>, body: 'Browse the history, preview what a revert would change, then revert or redo. History is append-only, so nothing your agent did is ever lost.', visual: <History /> },
  { eyebrow: 'Safety', title: <>Walled in by design. <span className="grad-text">Clean</span> on the way out.</>, body: 'The server only touches the folders you allow, and nowhere else. When you are ready to share a file, one sanitize step strips the authors, comments and revision history, and can redact emails and phone numbers. It runs when you ask for it, not automatically.', visual: <Safety /> },
  { eyebrow: 'Validation', title: <>A broken file <span className="grad-text">never</span> leaves the building.</>, body: 'Every save is checked against the Word package rules. If something is wrong, nothing is written, and the agent is told exactly how to fix it.', visual: <Validation /> },
];

export default function Pillars() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {cards.map((c, i) => (
        <article key={c.eyebrow} className="glass glass-glow reveal flex flex-col overflow-hidden p-6 sm:p-7" style={{ ['--d' as string]: `${(i % 2) * 0.12}s` }}>
          <div className="relative h-48 rounded-xl border border-line bg-[#04050c]/80 p-4 sm:h-52">{c.visual}</div>
          <p className="eyebrow mt-6">{c.eyebrow}</p>
          <h3 className="mt-2 text-2xl font-bold leading-tight tracking-tight sm:text-[1.7rem]">{c.title}</h3>
          <p className="mt-3 text-muted">{c.body}</p>
        </article>
      ))}
    </div>
  );
}
