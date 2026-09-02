import { useState, useRef, memo, useCallback, useMemo } from 'react';

function useRenderCount(name: string) {
  const c = useRef(0);
  c.current += 1;
  console.log(`render ${name} #${c.current}`);
  return c.current;
}

const ChildInline = memo(function ChildInline({ onClick, config }: { onClick: () => void; config: { id: number } }) {
  const r = useRenderCount('ChildInline (memo but inline props)');
  return (
    <div style={{ border: '2px solid #b00', padding: 12, borderRadius: 8 }}>
      <strong>ChildInline</strong> - memo'd but receives <code>{`onClick={() => {}}`}</code> + <code>{`{id}`}</code><br />
      <span style={{ fontSize: 12, color: '#b00' }}>renders: {r} (never skips - new ref every time)</span><br />
      <button onClick={onClick} style={{ marginTop: 8 }}>call onClick: {config.id}</button>
    </div>
  );
});

const ChildStable = memo(function ChildStable({ onClick, config }: { onClick: () => void; config: { id: number } }) {
  const r = useRenderCount('ChildStable (memo + stable props)');
  return (
    <div style={{ border: '2px solid #2e7d32', padding: 12, borderRadius: 8 }}>
      <strong>ChildStable</strong> - memo'd + <code>useCallback/useMemo</code><br />
      <span style={{ fontSize: 12, color: '#2e7d32' }}>renders: {r} (skips when parent ticks)</span><br />
      <button onClick={onClick} style={{ marginTop: 8 }}>call onClick: {config.id}</button>
    </div>
  );
});

export default function App() {
  const [count, setCount] = useState(0);
  const [id, setId] = useState(1);
  const r = useRenderCount('Parent App');

  // Unstable: new reference every render
  const inlineFn = () => console.log('inline', id);
  const inlineConfig = { id };

  // Stable: same reference until id changes
  const stableFn = useCallback(() => console.log('stable', id), [id]);
  const stableConfig = useMemo(() => ({ id }), [id]);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20, maxWidth: 700 }}>
      <h1>React.memo + Stable Props</h1>
      <p style={{ fontSize: 14, color: '#444' }}>
        Both children are <code>memo</code>. Left gets inline props, right gets <code>useCallback/useMemo</code> props.
        Click <strong>Parent tick</strong> (changes count, not id) - right skips, left re-renders.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setCount((c) => c + 1)} style={{ padding: '8px 16px' }}>
          Parent tick: {count} → +1
        </button>
        <button onClick={() => setId((i) => i + 1)} style={{ padding: '8px 16px' }}>
          Change prop id: {id} → +1
        </button>
      </div>
      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>App renders: {r}</div>
      <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <ChildInline onClick={inlineFn} config={inlineConfig} />
        <ChildStable onClick={stableFn} config={stableConfig} />
      </div>
      <pre style={{ marginTop: 16, background: '#f6f8fa', padding: 12, fontSize: 12 }}>
{`Parent tick (count 0->1, id stays 1):
  ChildInline: Object.is(prev onClick, next onClick) -> false (new ()=>{}) -> re-render
  ChildStable: Object.is(prev onClick, next onClick) -> true (useCallback) -> skip

Change id (1->2):
  Both: Object.is(prev config, next config) -> false (id changed) -> re-render`}
      </pre>
    </div>
  );
}
