import React, { useEffect, useState, useCallback } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function useSupabaseConfig() {
  const { siteConfig } = useDocusaurusContext() as any;
  const cf = siteConfig.customFields ?? {};
  const url = (typeof window !== 'undefined' && (window as any).__SUPABASE_URL__) || cf.supabaseUrl || '';
  const key = (typeof window !== 'undefined' && (window as any).__SUPABASE_ANON_KEY__) || cf.supabaseAnonKey || '';
  return { url, key };
}

type TableData = { name: string; rows: any[]; error?: string };

export default function SupabaseTablePreview() {
  const { url, key } = useSupabaseConfig();
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshingOne, setRefreshingOne] = useState<string | null>(null);

  const fetchTable = useCallback(async (table: string): Promise<TableData> => {
    if (!url) return { name: table, rows: [], error: 'Supabase not configured' };
    try {
      const res = await fetch(`${url.replace(/\/$/, '')}/functions/v1/run-sql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` },
        body: JSON.stringify({ sql: `SELECT * FROM ${table} ORDER BY id` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Query failed');
      return { name: table, rows: data.rows ?? [] };
    } catch (e: any) {
      return { name: table, rows: [], error: String(e.message ?? e) };
    }
  }, [url, key]);

  const load = useCallback(async () => {
    setLoading(true);
    const results = await Promise.all([fetchTable('users'), fetchTable('orders'), fetchTable('employees')]);
    setTables(results);
    setLoading(false);
  }, [fetchTable]);

  const refreshOne = useCallback(async (table: string) => {
    setRefreshingOne(table);
    const data = await fetchTable(table);
    setTables((prev) => prev.map((t) => (t.name === table ? data : t)));
    setRefreshingOne(null);
  }, [fetchTable]);

  useEffect(() => {
    load();
  }, [load]);

  if (!url) {
    return (
      <div style={{ border: '1px dashed var(--ifm-color-emphasis-300)', borderRadius: 8, padding: 12, margin: '16px 0', fontSize: 13, color: 'var(--ifm-color-emphasis-600)' }}>
        Supabase not configured - set SUPABASE_URL in .env and restart dev server to see live tables.
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: 8, overflow: 'hidden', margin: '16px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--ifm-color-emphasis-100)' }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>Current data in Supabase - 3 tables, live from your project</div>
        <button
          onClick={load}
          disabled={loading}
          style={{ padding: '4px 10px', background: 'white', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
        >
          {loading ? 'Refreshing...' : 'Refresh ↻'}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, padding: 12 }}>
        {tables.map((t) => (
          <div key={t.name} style={{ border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ padding: '6px 8px', background: 'var(--ifm-color-emphasis-100)', fontWeight: 600, fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{t.name}</span>
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontWeight: 400, color: 'var(--ifm-color-emphasis-600)' }}>{t.rows.length} rows</span>
                <button
                  onClick={() => refreshOne(t.name)}
                  disabled={refreshingOne === t.name}
                  title={`Refresh ${t.name}`}
                  style={{ padding: '2px 6px', fontSize: 11, background: 'white', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: 4, cursor: 'pointer' }}
                >
                  {refreshingOne === t.name ? '...' : '↻'}
                </button>
              </span>
            </div>
            {t.error ? (
              <pre style={{ margin: 0, padding: 8, fontSize: 12, whiteSpace: 'pre-wrap', background: '#ffebee' }}>{t.error}</pre>
            ) : t.rows.length === 0 ? (
              <div style={{ padding: 8, fontSize: 12, color: '#666' }}>No rows.</div>
            ) : (
              <div style={{ overflowX: 'auto', maxHeight: 220, overflowY: 'auto' }}>
                <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--ifm-color-emphasis-100)', position: 'sticky', top: 0 }}>
                      {Object.keys(t.rows[0]).map((c) => (
                        <th key={c} style={{ textAlign: 'left', padding: '4px 6px', borderBottom: '1px solid var(--ifm-color-emphasis-300)', whiteSpace: 'nowrap' }}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {t.rows.map((r: any, i: number) => (
                      <tr key={i}>
                        {Object.keys(t.rows[0]).map((c) => (
                          <td key={c} style={{ padding: '4px 6px', borderBottom: '1px solid var(--ifm-color-emphasis-100)', fontFamily: 'monospace', whiteSpace: 'nowrap', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }} title={String(r[c] ?? '')}>
                            {String(r[c] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ padding: '6px 12px', fontSize: 11, color: 'var(--ifm-color-emphasis-600)', borderTop: '1px solid var(--ifm-color-emphasis-200)' }}>
        Seed: 3 users, 7 orders, 6 employees - same as <code>supabase/sql/seed.sql</code>. Use Reset in any playground to revert writes.
      </div>
    </div>
  );
}
