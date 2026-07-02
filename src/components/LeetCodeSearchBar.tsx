import {type ReactNode, useState, useMemo} from 'react';
import Link from '@docusaurus/Link';
import problems from '../data/leetcode-problems';

const difficultyColors: Record<string, string> = {
  Easy: 'var(--ifm-color-success)',
  Medium: 'var(--ifm-color-warning)',
  Hard: 'var(--ifm-color-danger)',
};

export default function LeetCodeSearchBar(): ReactNode {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return problems;
    const q = query.toLowerCase();
    return problems.filter(
      (p) =>
        String(p.id).includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.difficulty.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        (p.type ?? 'problem').includes(q),
    );
  }, [query]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search by number, title, difficulty, or tags…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          fontSize: '1rem',
          border: '2px solid var(--ifm-color-emphasis-300)',
          borderRadius: '8px',
          outline: 'none',
          background: 'var(--ifm-background-color)',
          color: 'var(--ifm-font-color-base)',
          marginBottom: '1.5rem',
          boxSizing: 'border-box',
        }}
      />
      <p style={{margin: '0 0 0.75rem', fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-600)'}}>
        {filtered.length === problems.length
          ? `${problems.length} problems`
          : `${filtered.length} of ${problems.length} problems`}
      </p>
      {filtered.length === 0 ? (
        <p style={{color: 'var(--ifm-color-emphasis-600)'}}>
          No problems match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={p.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--ifm-color-emphasis-300)',
                textDecoration: 'none',
                color: 'var(--ifm-font-color-base)',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--ifm-color-primary)';
                e.currentTarget.style.boxShadow = '0 0 0 2px var(--ifm-color-primary-dim)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--ifm-color-emphasis-300)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  minWidth: '3.5rem',
                }}
              >
                LC-{p.id}
              </span>
              <span style={{flex: 1}}>{p.title}</span>
              {p.type === 'concept' ? (
                <span
                  style={{
                    color: 'var(--ifm-color-info)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  Concept
                </span>
              ) : (
                <span
                  style={{
                    color: difficultyColors[p.difficulty],
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  {p.difficulty}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
