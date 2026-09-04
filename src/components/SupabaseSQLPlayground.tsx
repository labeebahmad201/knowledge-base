import React, { useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

type Props = {
  defaultQuery: string;
  title?: string;
};

function useSupabaseConfig() {
  const { siteConfig } = useDocusaurusContext() as any;
  const cf = siteConfig.customFields ?? {};
  // customFields from docusaurus.config.ts (process.env at build time) + window fallback for local override
  const url = (typeof window !== 'undefined' && (window as any).__SUPABASE_URL__) || cf.supabaseUrl || '';
  const key = (typeof window !== 'undefined' && (window as any).__SUPABASE_ANON_KEY__) || cf.supabaseAnonKey || '';
  const resetSecret = cf.supabaseResetSecret || '';
  return { url, key, resetSecret };
}

// Fallback: if env not set, show setup instructions instead of broken fetch
function getFunctionsUrl(supabaseUrl: string, path: string) {
  if (!supabaseUrl) return '';
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/${path}`;
}

export default function SupabaseSQLPlayground({ defaultQuery, title }: Props) {
  const { url: SUPABASE_URL, key: SUPABASE_ANON_KEY, resetSecret: RESET_SECRET } = useSupabaseConfig();
  const [query, setQuery] = useState(defaultQuery);
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    setRows(null);

    const url = getFunctionsUrl(SUPABASE_URL, 'run-sql');
    if (!url) {
      setError('Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env, then deploy Edge Functions. See supabase/sql/seed.sql');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ sql: query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Query failed');
      setRows(data.rows ?? []);
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    setResetting(true);
    setError(null);
    const url = getFunctionsUrl(SUPABASE_URL, 'reset-db');
    if (!url) {
      setError('Supabase not configured for reset.');
      setResetting(false);
      return;
    }
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'x-reset-secret': RESET_SECRET || '',
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setError(null);
      setRows(null);
      // Optionally re-run current query after reset
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setResetting(false);
    }
  };

  const columns = rows && rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div style={{ border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: 8, overflow: 'hidden', margin: '16px 0' }}>
      {title && <div style={{ padding: '8px 12px', background: 'var(--ifm-color-emphasis-100)', fontWeight: 600, fontSize: 13 }}>{title}</div>}
      <div style={{ padding: 12 }}>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={4}
          style={{ width: '100%', fontFamily: 'monospace', fontSize: 13, padding: 8, borderRadius: 6, border: '1px solid var(--ifm-color-emphasis-300)' }}
          spellCheck={false}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            onClick={run}
            disabled={loading}
            style={{ padding: '6px 14px', background: '#1269ff', color: 'white', border: 0, borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
          >
            {loading ? 'Running...' : 'Run →'}
          </button>
          <button
            onClick={reset}
            disabled={resetting}
            style={{ padding: '6px 14px', background: 'var(--ifm-color-emphasis-200)', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: 6, cursor: 'pointer' }}
          >
            {resetting ? 'Resetting...' : 'Reset data'}
          </button>
          <span style={{ fontSize: 12, color: 'var(--ifm-color-emphasis-600)', alignSelf: 'center' }}>
            Runs against Supabase Postgres. Reset drops and recreates users/orders.
          </span>
        </div>

        {error && <pre style={{ marginTop: 12, padding: 12, background: '#ffebee', borderRadius: 6, fontSize: 12, whiteSpace: 'pre-wrap' }}>{error}</pre>}

        {rows && (
          <div style={{ marginTop: 12, overflowX: 'auto' }}>
            <div style={{ fontSize: 12, color: 'var(--ifm-color-emphasis-600)', marginBottom: 4 }}>{rows.length} rows {rows.length === 1000 ? '(capped at 1000)' : ''}</div>
            {rows.length === 0 ? (
              <div style={{ fontSize: 12, color: '#666' }}>No rows.</div>
            ) : (
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--ifm-color-emphasis-100)' }}>
                    {columns.map((c) => (
                      <th key={c} style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--ifm-color-emphasis-300)' }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      {columns.map((c) => (
                        <td key={c} style={{ padding: '6px 8px', borderBottom: '1px solid var(--ifm-color-emphasis-100)', fontFamily: 'monospace' }}>{String(r[c] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
