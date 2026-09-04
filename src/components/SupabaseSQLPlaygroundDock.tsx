import React, { useState, useEffect } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import SupabaseTablePreview from './SupabaseTablePreview';
import SqlResultTable from './SqlResultTable';
import { useSQLPlayground } from './SQLPlaygroundContext';

function useSupabaseConfig() {
  const { siteConfig } = useDocusaurusContext() as any;
  const cf = siteConfig.customFields ?? {};
  const url = (typeof window !== 'undefined' && (window as any).__SUPABASE_URL__) || cf.supabaseUrl || '';
  const key = (typeof window !== 'undefined' && (window as any).__SUPABASE_ANON_KEY__) || cf.supabaseAnonKey || '';
  const resetSecret = cf.supabaseResetSecret || '';
  return { url, key, resetSecret };
}

export default function SupabaseSQLPlaygroundDock() {
  const { query, setQuery } = useSQLPlayground();
  const { url, key, resetSecret } = useSupabaseConfig();
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const run = async () => {
    if (!url) {
      setError('Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env');
      return;
    }
    setLoading(true);
    setError(null);
    setRows(null);
    try {
      const res = await fetch(`${url.replace(/\/$/, '')}/functions/v1/run-sql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` },
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
    if (!url) {
      setError('Supabase not configured for reset.');
      return;
    }
    setResetting(true);
    setError(null);
    try {
      const res = await fetch(`${url.replace(/\/$/, '')}/functions/v1/reset-db`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}`, 'x-reset-secret': resetSecret || '' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setRows(null);
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setResetting(false);
    }
  };

  return (
    <div
      id="sql-playground-dock"
      style={{
        position: 'sticky',
        top: 70,
        maxHeight: 'calc(100vh - 90px)',
        overflowY: 'auto',
        border: '1px solid var(--ifm-color-emphasis-300)',
        borderRadius: 8,
        background: 'var(--ifm-background-color)',
      }}
    >
      <div style={{ padding: '8px 12px', background: 'var(--ifm-color-emphasis-100)', fontWeight: 700, fontSize: 13, position: 'sticky', top: 0, zIndex: 1 }}>
        SQL Playground - runs against Supabase
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ marginBottom: 8 }}>
          <SupabaseTablePreview key={refreshKey} />
        </div>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={6}
          style={{ width: '100%', fontFamily: 'monospace', fontSize: 12, padding: 8, borderRadius: 6, border: '1px solid var(--ifm-color-emphasis-300)' }}
          spellCheck={false}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <button onClick={run} disabled={loading} style={{ padding: '6px 14px', background: '#1269ff', color: 'white', border: 0, borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
            {loading ? 'Running...' : 'Run →'}
          </button>
          <button onClick={reset} disabled={resetting} style={{ padding: '6px 14px', background: 'var(--ifm-color-emphasis-200)', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
            {resetting ? 'Resetting...' : 'Reset data'}
          </button>
        </div>
        {error && <pre style={{ marginTop: 8, padding: 8, background: '#ffebee', borderRadius: 6, fontSize: 11, whiteSpace: 'pre-wrap' }}>{error}</pre>}
        {rows && (
          <div style={{ marginTop: 8, overflowX: 'auto' }}>
            <div style={{ fontSize: 11, color: 'var(--ifm-color-emphasis-600)', marginBottom: 4 }}>{rows.length} rows {rows.length === 1000 ? '(capped)' : ''}</div>
            <SqlResultTable rows={rows} fontSize={11} />
          </div>
        )}
        <div style={{ fontSize: 10, color: 'var(--ifm-color-emphasis-600)', marginTop: 8 }}>
          Copy any snippet via <code>Run in playground →</code> below, edit here, then Run.
        </div>
      </div>
    </div>
  );
}
