import { useState } from 'react';
import session from '../data/demo-session.json';

type Step = (typeof session.steps)[number];
type Group = 'build' | 'edit' | 'refuse' | 'rollback';

const tabs: { id: Group; label: string; blurb: string }[] = [
  { id: 'build', label: 'Build a report', blurb: 'One call turns a Markdown file into a three-page board report: a styled table, three native charts, callouts, a footnote, a link and a code block. Then the agent checks it and saves.' },
  { id: 'edit', label: 'Edit it later', blurb: 'The agent re-opens the saved report, reads it as TOON rows, then changes a table cell and adds a callout in one batch.' },
  { id: 'refuse', label: 'Send a bad edit', blurb: 'The agent sets a colour that is not a colour. Save is refused, nothing reaches the disk, and the error says how to fix it.' },
  { id: 'rollback', label: 'Break a batch', blurb: 'Three edits, the third points at a node that does not exist. None of the three is applied.' },
];

function Json({ value }: { value: unknown }) {
  const copy = JSON.parse(JSON.stringify(value));
  let toon: string | null = null;
  if (copy && typeof copy === 'object' && typeof copy.toonText === 'string') {
    const lines = copy.toonText.split('\n');
    toon = lines.slice(0, 9).join('\n') + (lines.length > 9 ? '\n…' : '');
    copy.toonText = '(see rows below)';
  }
  return (
    <>
      <pre className="whitespace-pre-wrap break-words text-[0.75rem] leading-relaxed">{JSON.stringify(copy, null, 2)}</pre>
      {toon && <pre className="mt-2 overflow-x-auto rounded border border-line bg-bg p-2 text-[0.7rem] leading-snug text-muted">{toon}</pre>}
    </>
  );
}

function StepCard({ step, n }: { step: Step; n: number }) {
  const refused = !step.ok;
  const [open, setOpen] = useState(n === 1 || refused);
  return (
    <li className={`glass rounded-xl border ${refused ? 'border-refuse' : 'border-line'}`}>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left ${open ? 'border-b border-line' : ''}`}>
        <span className="text-sm font-medium text-fg">
          <span className="mr-2 font-mono text-xs text-subtle">{n}</span>
          {step.title}
          <span className="ml-2 font-mono text-xs text-subtle">{step.tool}</span>
        </span>
        <span className="flex items-center gap-3">
          <span className={`font-mono text-[0.7rem] uppercase tracking-wider ${refused ? 'text-refuse' : 'text-pass'}`}>{refused ? 'Refused' : 'Accepted'}</span>
          <span className="text-subtle transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }} aria-hidden="true">⌄</span>
        </span>
      </button>
      {open && <div className="space-y-3 p-3">
        <div>
          <p className="mb-1 font-mono text-[0.7rem] uppercase tracking-wider text-cyan">Agent calls <span className="text-fg normal-case tracking-normal">{step.tool}</span></p>
          <div className="overflow-x-auto rounded border border-line bg-sunken p-2 font-mono text-muted"><Json value={step.args} /></div>
        </div>
        <div>
          <p className="mb-1 font-mono text-[0.7rem] uppercase tracking-wider text-subtle">ASTra returns{step.trimmed ? ' (trimmed)' : ''}</p>
          <div className={`overflow-x-auto rounded border bg-sunken p-2 font-mono ${refused ? 'border-refuse/60 text-fg' : 'border-line text-muted'}`}><Json value={step.response} /></div>
        </div>
        {step.note && <p className="text-sm text-muted">{step.note}</p>}
      </div>}
    </li>
  );
}

export default function Demo() {
  const [group, setGroup] = useState<Group>('build');
  const [page, setPage] = useState(0);
  const [side, setSide] = useState<'before' | 'after'>('after');
  const steps = session.steps.filter((s) => s.group === group);
  const current = tabs.find((t) => t.id === group)!;

  function onKey(e: React.KeyboardEvent, i: number) {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = tabs[(i + dir + tabs.length) % tabs.length];
    setGroup(next.id);
    document.getElementById(`demo-tab-${next.id}`)?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label="Demo scenarios" className="flex flex-wrap gap-2">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            id={`demo-tab-${t.id}`}
            role="tab"
            aria-selected={group === t.id}
            aria-controls="demo-panel"
            tabIndex={group === t.id ? 0 : -1}
            onClick={() => setGroup(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${group === t.id ? 'border-transparent bg-gradient-to-r from-[#c4b5fd] to-[#67e8f9] text-[#0b0720]' : 'border-line-strong text-muted hover:text-fg'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="mt-4 max-w-2xl text-muted">{current.blurb}</p>

      <div id="demo-panel" role="tabpanel" aria-labelledby={`demo-tab-${group}`} className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <ol className="space-y-4">
          {steps.map((s, i) => <StepCard key={`${group}-${i}`} step={s} n={i + 1} />)}
        </ol>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          {group === 'build' && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="eyebrow">The report, rendered</span>
                <div className="inline-flex rounded-lg border border-line-strong p-0.5" role="group" aria-label="Page">
                  {session.images.pages.map((_, i) => (
                    <button key={i} type="button" aria-pressed={page === i} onClick={() => setPage(i)} className={`rounded px-3 py-1 text-xs font-medium ${page === i ? 'bg-violet text-white' : 'text-muted hover:text-fg'}`}>Page {i + 1}</button>
                  ))}
                </div>
              </div>
              <img src={session.images.pages[page]} alt={`Page ${page + 1} of the Atlas Robotics board report built by one compose call`} width={800} className="w-full paper-shadow rounded-md bg-paper" />
              <p className="mt-2 text-xs text-subtle">Rendered by the ASTra CLI (<code>astra visual</code>) from the saved .docx. The charts are native Word charts, not pictures.</p>
            </div>
          )}
          {group === 'edit' && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="eyebrow">Page 3, rendered</span>
                <div className="inline-flex rounded-lg border border-line-strong p-0.5" role="group" aria-label="Before or after">
                  {(['before', 'after'] as const).map((s) => (
                    <button key={s} type="button" aria-pressed={side === s} onClick={() => setSide(s)} className={`rounded px-3 py-1 text-xs font-medium capitalize ${side === s ? 'bg-violet text-white' : 'text-muted hover:text-fg'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <img src={side === 'before' ? session.images.pages[2] : session.images.edited} alt={side === 'before' ? 'Page three before the agent edit' : 'Page three after the agent added a rose callout under the risk list'} width={800} className="w-full paper-shadow rounded-md bg-paper" />
              <p className="mt-2 text-xs text-subtle">The table cell change is on page 1 (Net new customers, Q3 2026: 17 to 18).</p>
            </div>
          )}
          {group === 'refuse' && (
            <div className="rounded-xl border border-refuse/70 bg-refuse/5 p-5">
              <p className="eyebrow !text-refuse">File on disk</p>
              <dl className="mt-3 space-y-2 font-mono text-sm">
                <div className="flex justify-between gap-4"><dt className="text-muted">sha256 before</dt><dd>{session.document.hashBefore}…</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted">sha256 after refusal</dt><dd>{session.document.hashAfterRefusal}…</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted">new file written</dt><dd className="text-refuse">no</dd></div>
              </dl>
              <p className="mt-4 text-sm text-muted">The validator checks the whole package at save time. It names the exact element that is wrong and returns a remedy the agent can act on. The agent fixes the value and the second save passes.</p>
            </div>
          )}
          {group === 'rollback' && (
            <div className="glass p-5">
              <p className="eyebrow">Document state afterwards</p>
              <dl className="mt-3 space-y-2 font-mono text-sm">
                <div className="flex justify-between gap-4"><dt className="text-muted">edits sent</dt><dd>3</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted">edits applied</dt><dd className="text-refuse">0</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted">revision</dt><dd>1 (unchanged)</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted">unsaved changes</dt><dd>false</dd></div>
              </dl>
              <p className="mt-4 text-sm text-muted">The first two edits were valid, and they were undone too. A batch is all or nothing, so the agent never has to work out which half landed.</p>
            </div>
          )}
        </aside>
      </div>
      <p className="mt-6 text-xs text-subtle">
        Recorded from a real run of ASTra MCP server {session.source.server} (repository commit {session.source.commit}). Session IDs and folder paths are shortened; nothing else is edited except where marked trimmed. Regenerate with <code>npm run demo</code>.
      </p>
    </div>
  );
}
