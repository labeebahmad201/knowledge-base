import React, { useEffect, useRef, useState } from 'react';

type Props = {
  rows: any[];
  fontSize?: number;
};

// Result table with user-resizable column widths. Long content wraps (pre-wrap) so
// nothing is cut off, and each header reveals a drag handle to widen/narrow the column.
export default function SqlResultTable({ rows, fontSize = 11 }: Props) {
  const columns = rows && rows.length > 0 ? Object.keys(rows[0]) : [];
  const [widths, setWidths] = useState<Record<string, number | undefined>>({});
  const [activeCol, setActiveCol] = useState<string | null>(null);
  const dragRef = useRef<{ col: string; startX: number; startW: number } | null>(null);

  const startResize = (col: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startW = widths[col] ?? 120;
    dragRef.current = { col, startX: e.clientX, startW };
    setActiveCol(col);
  };

  useEffect(() => {
    if (!activeCol) return;
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { col, startX, startW } = dragRef.current;
      const dx = e.clientX - startX;
      setWidths((prev) => ({ ...prev, [col]: Math.max(40, startW + dx) }));
    };
    const onUp = () => {
      dragRef.current = null;
      setActiveCol(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [activeCol]);

  if (!rows || rows.length === 0) {
    return <div style={{ fontSize, color: '#666' }}>No rows.</div>;
  }

  return (
    <>
      <style>{`
        .sql-res-th { position: relative; user-select: none; }
        .sql-res-th .sql-resize-handle { position: absolute; top: 0; right: 0; bottom: 0; width: 6px; cursor: col-resize; opacity: 0; transition: opacity .1s; }
        .sql-res-th:hover .sql-resize-handle, .sql-res-th.active .sql-resize-handle { opacity: 1; }
        .sql-res-th .sql-resize-handle::after { content: ''; position: absolute; top: 0; bottom: 0; left: 2px; width: 1px; background: var(--ifm-color-primary); }
      `}</style>
      <table style={{ width: '100%', fontSize, borderCollapse: 'collapse', tableLayout: 'auto' }}>
        <thead>
          <tr style={{ background: 'var(--ifm-color-emphasis-100)' }}>
            {columns.map((c) => (
              <th
                key={c}
                className={`sql-res-th${activeCol === c ? ' active' : ''}`}
                style={{
                  textAlign: 'left',
                  padding: '4px 10px 4px 6px',
                  borderBottom: '1px solid var(--ifm-color-emphasis-300)',
                  borderRight: '1px solid var(--ifm-color-emphasis-200)',
                  whiteSpace: 'nowrap',
                  minWidth: widths[c],
                }}
                title={c}
              >
                {c}
                <div className="sql-resize-handle" onMouseDown={startResize(c)} title="Drag to resize column" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td
                  key={c}
                  style={{
                    padding: '4px 6px',
                    borderBottom: '1px solid var(--ifm-color-emphasis-100)',
                    borderRight: '1px solid var(--ifm-color-emphasis-100)',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    minWidth: widths[c],
                    verticalAlign: 'top',
                  }}
                  title={String(r[c] ?? '')}
                >
                  {String(r[c] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
