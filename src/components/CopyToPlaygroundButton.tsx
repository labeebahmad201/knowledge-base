import React from 'react';
import { useSQLPlayground } from './SQLPlaygroundContext';

export default function CopyToPlaygroundButton({ code, label = 'Run in playground →' }: { code: string; label?: string }) {
  const { setQuery } = useSQLPlayground();

  const handle = () => {
    const q = code.trim();
    setQuery(q);
    // Fallback for cross-root context (MDX) - dispatch global event and window setter
    try {
      (window as any).__setSQLPlaygroundQuery?.(q);
      window.dispatchEvent(new CustomEvent('sql-playground-set-query', { detail: q }));
    } catch {}
    // On mobile the playground is fixed, no need to scroll, but ensure it's visible
    const el = document.getElementById('sql-playground-dock');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <button
      onClick={handle}
      style={{
        marginTop: 6,
        padding: '4px 10px',
        fontSize: 12,
        background: 'var(--ifm-color-primary)',
        color: 'white',
        border: 0,
        borderRadius: 6,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}
