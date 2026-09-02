import { useState, useRef } from 'react';

// Helper to count renders and log
function useRenderCount(name: string) {
  const count = useRef(0);
  count.current += 1;
  console.log(`render ${name} #${count.current}`);
  return count.current;
}

function Avatar({ count }: { count: number }) {
  const renders = useRenderCount('Avatar (prop drilling)');
  return (
    <div style={{ border: '2px solid #1269ff', padding: 12, borderRadius: 8, marginTop: 8 }}>
      <strong>Avatar</strong> - needs count: {count} <br />
      <span style={{ fontSize: 12, color: '#666' }}>renders: {renders} (check console)</span>
    </div>
  );
}

function Sidebar({ count }: { count: number }) {
  const renders = useRenderCount('Sidebar (prop drilling - just forwards)');
  return (
    <div style={{ border: '1px dashed #999', padding: 12, borderRadius: 8 }}>
      <div>Sidebar - does NOT use count, just forwards it</div>
      <div style={{ fontSize: 12, color: '#666' }}>renders: {renders}</div>
      <Avatar count={count} />
    </div>
  );
}

function Layout({ count }: { count: number }) {
  const renders = useRenderCount('Layout (prop drilling - just forwards)');
  return (
    <div style={{ border: '1px dashed #999', padding: 12, borderRadius: 8, marginTop: 12 }}>
      <div>Layout - does NOT use count, just forwards it</div>
      <div style={{ fontSize: 12, color: '#666' }}>renders: {renders}</div>
      <Sidebar count={count} />
    </div>
  );
}

export default function App() {
  const [count, setCount] = useState(0);
  const renders = useRenderCount('App');

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20, maxWidth: 600 }}>
      <h1>Prop Drilling - Re-render Demo</h1>
      <p>App holds <code>count</code> and drills it via props: App → Layout → Sidebar → Avatar.</p>
      <p style={{ fontSize: 13, color: '#b00' }}>
        Click +1: <strong>all</strong> intermediaries re-render even though they don't use count.
        Open console to see logs. Renders: {renders}
      </p>
      <button onClick={() => setCount((c) => c + 1)} style={{ padding: '8px 16px', fontSize: 16 }}>
        count: {count} → +1
      </button>
      <button onClick={() => setCount(0)} style={{ marginLeft: 8 }}>reset</button>
      <Layout count={count} />
      <pre style={{ marginTop: 16, background: '#f6f8fa', padding: 12, fontSize: 12 }}>
{`App {count} -> Layout {count} -> Sidebar {count} -> Avatar {count}
Every intermediate receives a new prop, so React re-renders it.`}
      </pre>
    </div>
  );
}
