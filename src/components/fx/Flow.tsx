import { useState } from 'react';
import demo from '../../data/demo-session.json';
import { useInView, useTicker } from './hooks';

const rows = demo.readCost.toonSample.split('\n').slice(0, 9);

const stages = [
  { key: 'ask', name: 'Ask', line: 'You say it in plain words.' },
  { key: 'read', name: 'Read', line: 'The agent reads rows, not XML.' },
  { key: 'edit', name: 'Edit', line: 'Typed operations, one batch.' },
  { key: 'check', name: 'Check', line: 'Validated before it counts.' },
  { key: 'see', name: 'See', line: 'It looks at its own pages.' },
  { key: 'ship', name: 'Ship', line: 'Save it, or roll it back.' },
] as const;

function Panel({ k }: { k: (typeof stages)[number]['key'] }) {
  if (k === 'ask') return (
    <div className="mx-auto max-w-xl space-y-3">
      <div className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-md bg-violet/25 px-4 py-3 text-sm text-fg">Turn the Q3 notes into a board report. Add the revenue chart and flag the risks.</div>
      <div className="w-fit max-w-[90%] rounded-2xl rounded-bl-md border border-line bg-white/5 px-4 py-3 text-sm text-muted">On it. I’ll open the folder, build the report, check it, and show you the pages.</div>
    </div>
  );
  if (k === 'read') return (
    <pre className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-line bg-[#03040a] p-4 text-[0.72rem] leading-relaxed text-muted">
      {rows.map((r, i) => (<div key={i} style={{ animation: `rise .5s ${i * 90}ms both` }}>{r.length > 118 ? r.slice(0, 115) + '…' : r}</div>))}
    </pre>
  );
  if (k === 'edit') return (
    <pre className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-line bg-[#03040a] p-4 text-[0.78rem] leading-relaxed">
      {[
        '{ "action": "table", "operation": "updateCell",',
        '  "target": "t_002", "rowIndex": 1, "columnIndex": 2,',
        '  "text": "$14.2M" },',
        '{ "action": "style", "target": "md_0001", "color": "1E3A8A" },',
        '{ "action": "chart", "operation": "insert", "chartType": "columnStacked" }',
      ].map((l, i) => (<div key={i} className="text-[#ddd6fe]" style={{ animation: `rise .5s ${i * 120}ms both` }}>{l}</div>))}
    </pre>
  );
  if (k === 'check') return (
    <div className="mx-auto grid max-w-xl gap-2 sm:grid-cols-2">
      {['Structure is sound', 'Relationships are wired', 'Styles resolve', 'Matches the schema'].map((c, i) => (
        <div key={c} className="flex items-center gap-3 rounded-xl border border-pass/30 bg-pass/5 px-4 py-3 text-sm text-pass" style={{ animation: `rise .5s ${i * 140}ms both` }}><span>✓</span>{c}</div>
      ))}
      <p className="sm:col-span-2 mt-1 text-center text-sm text-muted">Something wrong? Nothing is written, and the agent gets a precise fix.</p>
    </div>
  );
  if (k === 'see') return (
    <div className="mx-auto flex max-w-xl items-center justify-center gap-4">
      <div className="paper-shadow relative w-48 overflow-hidden rounded-md bg-white sm:w-56">
        <img src="/showcase/atlas-p3.webp" alt="A rendered report page returned to the agent" width={1240} height={1605} loading="lazy" className="block w-full" />
        <div className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-cyan/40 to-transparent" style={{ animation: 'scan 2.6s linear infinite' }} />
      </div>
      <p className="max-w-[12rem] text-sm text-muted">Rendered page images come back to the agent, so it can catch a layout slip before you do.</p>
    </div>
  );
  return (
    <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-pass/40 bg-pass/5 p-4"><p className="font-mono text-xs text-pass">save_document</p><p className="mt-1 text-sm text-fg">Written, validated, and recorded as a revision.</p></div>
      <div className="rounded-xl border border-violet/40 bg-violet/10 p-4"><p className="font-mono text-xs text-[#ddd6fe]">revert_document</p><p className="mt-1 text-sm text-fg">Changed your mind? Go back to any earlier revision.</p></div>
    </div>
  );
}

export default function Flow() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const [pinned, setPinned] = useState<number | null>(null);
  const [auto] = useTicker(stages.length, 3600, inView && pinned === null);
  const active = pinned ?? auto;
  return (
    <div ref={ref}>
      <ol className="relative grid grid-cols-3 gap-y-6 sm:grid-cols-6" aria-label="From request to finished document">
        <div className="pointer-events-none absolute left-[8%] right-[8%] top-5 hidden h-px bg-line-strong sm:block" />
        <div className="pointer-events-none absolute left-[8%] top-5 hidden h-px sm:block" style={{ width: `${(active / (stages.length - 1)) * 84}%`, background: 'linear-gradient(90deg,#8b5cf6,#22d3ee)', boxShadow: '0 0 14px 1px rgb(34 211 238 / .7)', transition: 'width .8s cubic-bezier(.2,.7,.2,1)' }} />
        {stages.map((s, i) => (
          <li key={s.key} className="relative text-center">
            <button type="button" onClick={() => setPinned(i)} aria-current={i === active ? 'step' : undefined} className="group mx-auto flex flex-col items-center gap-2 bg-transparent text-inherit">
              <span className={`grid h-10 w-10 place-items-center rounded-full border font-mono text-sm transition-all duration-500 ${i <= active ? 'border-transparent text-[#0b0720]' : 'border-line-strong text-subtle'}`} style={{ background: i <= active ? 'linear-gradient(135deg,#c4b5fd,#67e8f9)' : '#080a16', transform: i === active ? 'scale(1.18)' : 'none', boxShadow: i === active ? '0 0 28px 4px rgb(139 92 246 / .55)' : 'none' }}>{i + 1}</span>
              <span className={`text-sm font-semibold transition-colors ${i === active ? 'text-fg' : 'text-subtle'}`}>{s.name}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-center text-lg font-medium text-fg">{stages[active].line}</p>
      <div className="glass mt-6 min-h-[17rem] p-5 sm:p-8" key={active} style={{ animation: 'rise .6s both' }}>
        <Panel k={stages[active].key} />
      </div>
    </div>
  );
}
