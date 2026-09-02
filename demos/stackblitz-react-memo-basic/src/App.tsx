import { useState, useRef, memo } from 'react';

function useRenderCount(name: string) {
  const c = useRef(0);
  c.current += 1;
  console.log(`render ${name} #${c.current}`);
  return c.current;
}

function ExpensiveChart() {
  const r = useRenderCount('ExpensiveChart (no memo)');
  // Simulate expensive work
  let s = 0;
  for (let i = 0; i < 500000; i++) s += i % 3;
  return (
    <div style={{ border: '2px solid #b00', padding: 12, borderRadius: 8 }}>
      <strong>ExpensiveChart</strong> (no memo) - re-renders every parent update<br />
      <span style={{ fontSize: 12, color: '#666' }}>renders: {r} | work: {s % 100}</span>
    </div>
  );
}

const MemoChart = memo(function MemoChart() {
  const r = useRenderCount('MemoChart (memo, no props)');
  let s = 0;
  for (let i = 0; i < 500000; i++) s += i % 3;
  return (
    <div style={{ border: '2px solid #2e7d32', padding: 12, borderRadius: 8 }}>
      <strong>MemoChart</strong> (memo) - skips when props same<br />
      <span style={{ fontSize: 12, color: '#666' }}>renders: {r} | work: {s % 100}</span>
    </div>
  );
});

export default function App() {
  const [count, setCount] = useState(0);
  const r = useRenderCount('Parent App');
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20, maxWidth: 650 }}>
      <h1>React.memo - Basic</h1>
      <p style={{ fontSize: 14, color: '#444' }}>
        Parent holds <code>count</code>. Both charts receive no props. One is plain, one is <code>memo</code>.
      </p>
      <button onClick={() => setCount((c) => c + 1)} style={{ padding: '8px 16px' }}>
        Parent count: {count} → +1
      </button>
      <span style={{ marginLeft: 12, fontSize: 12, color: '#666' }}>App renders: {r}</span>
      <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <ExpensiveChart />
        <MemoChart />
      </div>
      <pre style={{ marginTop: 16, background: '#f6f8fa', padding: 12, fontSize: 12 }}>
{`Without memo: Parent re-render -> ExpensiveChart re-renders unconditionally
With memo:    Parent re-render -> MemoChart compares props (none) -> skip`}
      </pre>
    </div>
  );
}
