import React, { useState, useRef, useEffect } from 'react';
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

export default function MovableSQLPlayground() {
  const { query, setQuery } = useSQLPlayground();
  const { url, key, resetSecret } = useSupabaseConfig();
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [tablesCollapsed, setTablesCollapsed] = useState(false);

  // Fallback: also listen for global event/window setter so Copy buttons work even if context instances differ (MDX)
  useEffect(() => {
    (window as any).__setSQLPlaygroundQuery = (q: string) => {
      setCollapsed(false);
      setQuery(q);
    };
    const handler = (e: any) => {
      setCollapsed(false);
      setQuery(e.detail);
    };
    window.addEventListener('sql-playground-set-query', handler as any);
    return () => {
      window.removeEventListener('sql-playground-set-query', handler as any);
      delete (window as any).__setSQLPlaygroundQuery;
    };
  }, [setQuery]);

  // Position: fixed, 30% width on right, draggable via header + resizable via edges
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 }); // 0 means default 30% / calc(100vh-80px)
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState<null | 'left' | 'bottom' | 'corner'>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    e.preventDefault();
  };

  const onResizeDown = (dir: 'left' | 'bottom' | 'corner') => (e: React.MouseEvent) => {
    setResizing(dir);
    const w = size.width || window.innerWidth * 0.3;
    const h = size.height || window.innerHeight - 80;
    resizeRef.current = { startX: e.clientX, startY: e.clientY, startW: w, startH: h };
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const dx = e.clientX - resizeRef.current.startX;
      const dy = e.clientY - resizeRef.current.startY;
      if (resizing === 'left' || resizing === 'corner') {
        const maxW = window.innerWidth * 0.8;
        const newW = Math.min(maxW, Math.max(320, resizeRef.current.startW - dx));
        setSize((s) => ({ ...s, width: newW }));
      }
      if (resizing === 'bottom' || resizing === 'corner') {
        const newH = Math.min(window.innerHeight - 40, Math.max(300, resizeRef.current.startH + dy));
        setSize((s) => ({ ...s, height: newH }));
      }
    };
    const onUp = () => setResizing(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resizing]);

  const run = async () => {
    if (!url) {
      setError('Supabase not configured. Set SUPABASE_URL in .env');
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
    if (!url) return;
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

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          zIndex: 1000,
          padding: '10px 16px',
          background: '#1269ff',
          color: 'white',
          border: 0,
          borderRadius: 8,
          cursor: 'pointer',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        SQL Playground ▶
      </button>
    );
  }

  const width = size.width ? `${size.width}px` : '30%';
  const height = size.height ? `${size.height}px` : 'calc(100vh - 80px)';

  return (
    <div
      id="sql-playground-dock"
      style={{
        position: 'fixed',
        top: `calc(60px + ${pos.y}px)`,
        right: `calc(0px - ${pos.x}px)`,
        width,
        minWidth: 360,
        maxWidth: '80%',
        height,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--ifm-color-emphasis-300)',
        borderRadius: 8,
        background: 'var(--ifm-background-color)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        overflow: 'hidden',
      }}
    >
      <div
        onMouseDown={onMouseDown}
        style={{
          padding: '8px 12px',
          background: 'var(--ifm-color-emphasis-100)',
          fontWeight: 700,
          fontSize: 13,
          cursor: dragging ? 'grabbing' : 'grab',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          userSelect: 'none',
        }}
      >
        <span>SQL Playground - Supabase (drag header to move, edges to resize)</span>
        <button
          onClick={() => setCollapsed(true)}
          style={{ background: 'transparent', border: 0, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
          title="Minimize"
        >
          −
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <button
            onClick={() => setTablesCollapsed((v) => !v)}
            style={{ width: '100%', padding: '6px 8px', fontSize: 12, background: 'var(--ifm-color-emphasis-100)', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: 6, cursor: 'pointer', textAlign: 'left' }}
          >
            {tablesCollapsed ? '▶ Show tables' : '▼ Hide tables'} - {tablesCollapsed ? 'collapsed to free space for results' : '3 tables'}
          </button>
          {!tablesCollapsed && <SupabaseTablePreview key={refreshKey} />}
        </div>

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={5}
          style={{ width: '100%', fontFamily: 'monospace', fontSize: 12, padding: 8, borderRadius: 6, border: '1px solid var(--ifm-color-emphasis-300)', flexShrink: 0 }}
          spellCheck={false}
        />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={run} disabled={loading} style={{ padding: '6px 14px', background: '#1269ff', color: 'white', border: 0, borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
            {loading ? 'Running...' : 'Run →'}
          </button>
          <button onClick={reset} disabled={resetting} style={{ padding: '6px 14px', background: 'var(--ifm-color-emphasis-200)', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
            {resetting ? 'Resetting...' : 'Reset data'}
          </button>
        </div>

        {error && <pre style={{ margin: 0, padding: 8, background: '#ffebee', borderRadius: 6, fontSize: 11, whiteSpace: 'pre-wrap' }}>{error}</pre>}

        {rows && (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ fontSize: 11, color: 'var(--ifm-color-emphasis-600)', marginBottom: 4 }}>{rows.length} rows {rows.length === 1000 ? '(capped)' : ''}</div>
            <SqlResultTable rows={rows} fontSize={11} />
          </div>
        )}
      </div>
      {/* Resize handles */}
      <div onMouseDown={onResizeDown('left')} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, cursor: 'ew-resize' }} title="Drag to resize width" />
      <div onMouseDown={onResizeDown('bottom')} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 6, cursor: 'ns-resize' }} title="Drag to resize height" />
      <div onMouseDown={onResizeDown('corner')} style={{ position: 'absolute', right: 0, bottom: 0, width: 16, height: 16, cursor: 'nwse-resize', background: 'linear-gradient(135deg, transparent 50%, var(--ifm-color-emphasis-300) 50%)' }} title="Drag to resize" />
    </div>
  );
}
