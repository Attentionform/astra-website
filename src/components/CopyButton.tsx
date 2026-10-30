import { useState } from 'react';

interface Props { text: string; label?: string; className?: string }

export default function CopyButton({ text, label = 'Copy', className = '' }: Props) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
    setTimeout(() => setState('idle'), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`rounded-md border border-line-strong px-2.5 py-1 text-xs font-medium text-muted hover:text-fg hover:border-subtle ${className}`}
      aria-live="polite"
    >
      {state === 'copied' ? 'Copied' : state === 'failed' ? 'Select and copy' : label}
    </button>
  );
}
