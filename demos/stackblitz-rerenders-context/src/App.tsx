import { createContext, useContext, useState, useRef, memo, useMemo } from 'react';

function useRenderCount(name: string) {
  const count = useRef(0);
  count.current += 1;
  console.log(`render ${name} #${count.current}`);
  return count.current;
}

const CountContext = createContext<number>(0);

// Consumer - re-renders when context changes
function Avatar() {
  const count = useContext(CountContext);
  const renders = useRenderCount('Avatar (context consumer)');
  return (
    <div style={{ border: '2px solid #1269ff', padding: 12, borderRadius: 8, marginTop: 8 }}>
      <strong>Avatar</strong> - needs count: {count} <br />
      <span style={{ fontSize: 12, color: '#666' }}>renders: {renders} (re-renders on context change - expected)</span>
    </div>
  );
}

// Intermediate - memo'd, does NOT consume context, so it SKIPS re-render on context change
const Sidebar = memo(function Sidebar() {
  const renders = useRenderCount('Sidebar (memo + no context)');
  return (
    <div style={{ border: '1px dashed #2e7d32', padding: 12, borderRadius: 8 }}>
      <div>Sidebar - memo'd, does NOT useContext, does NOT receive prop</div>
      <div style={{ fontSize: 12, color: '#2e7d32' }}>renders: {renders} (should stay 1 after memo)</div>
      <Avatar />
    </div>
  );
});

const Layout = memo(function Layout() {
  const renders = useRenderCount('Layout (memo + no context)');
  return (
    <div style={{ border: '1px dashed #2e7d32', padding: 12, borderRadius: 8, marginTop: 12 }}>
      <div>Layout - memo'd, does NOT useContext</div>
      <div style={{ fontSize: 12, color: '#2e7d32' }}>renders: {renders} (should stay 1 after memo)</div>
      <Sidebar />
    </div>
  );
});

// Without memo - this one WILL re-render even with context, because parent App re-renders
function LayoutUnmemoized() {
  const renders = useRenderCount('LayoutUnmemoized (no memo)');
  return (
    <div style={{ border: '1px dashed #b00', padding: 12, borderRadius: 8, marginTop: 12 }}>
      <div>LayoutUnmemoized - NOT memo'd (still re-renders because App re-rendered, even without prop)</div>
      <div style={{ fontSize: 12, color: '#b00' }}>renders: {renders} (re-renders every time)</div>
      <Sidebar />
    </div>
  );
}

export default function App() {
  const [count, setCount] = useState(0);
  const renders = useRenderCount('App');
  const countValue = count; // stable primitive

  // For object context, you'd memoize value to avoid extra renders
  // const value = useMemo(() => ({ count }), [count]);

  return (
    <CountContext.Provider value={countValue}>
      <div style={{ fontFamily: 'sans-serif', padding: 20, maxWidth: 700 }}>
        <h1>Context + memo - Re-render Demo</h1>
        <p>
          App holds <code>count</code> in <code>CountContext.Provider value={`{count}`}</code>. <br />
          Tree: App → Layout(memo) → Sidebar(memo) → Avatar(useContext). Intermediaries don't receive props or read context.
        </p>
        <p style={{ fontSize: 13, color: '#2e7d32' }}>
          Click +1: Only <strong>App + Avatar</strong> re-render. Memo'd intermediaries skip. Open console.
        </p>
        <button onClick={() => setCount((c) => c + 1)} style={{ padding: '8px 16px', fontSize: 16 }}>
          count: {count} → +1
        </button>
        <button onClick={() => setCount(0)} style={{ marginLeft: 8 }}>reset</button>
        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>App renders: {renders}</div>

        <Layout />
        <div style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
          Compare with unmemoized (still re-renders because parent rendered):
        </div>
        <LayoutUnmemoized />

        <pre style={{ marginTop: 16, background: '#f6f8fa', padding: 12, fontSize: 12 }}>
{`Without memo: App re-render -> children re-render anyway (React default)
With memo + no props/context: React skips render if props shallow equal
With context: only useContext consumers are notified, intermediaries can skip`}
        </pre>
      </div>
    </CountContext.Provider>
  );
}
