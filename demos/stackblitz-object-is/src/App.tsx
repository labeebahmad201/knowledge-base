import { useState, useRef } from 'react';

function Row({ a, b, labelA, labelB }: { a: any; b: any; labelA: string; labelB: string }) {
  const eq = a == b;
  const strict = a === b;
  const is = Object.is(a, b);
  // SameValueZero = like Set: NaN==NaN, 0==-0
  const sameValueZero = a === b || (Number.isNaN(a) && Number.isNaN(b));
  return (
    <tr style={{ fontFamily: 'monospace', fontSize: 13 }}>
      <td>{labelA}</td>
      <td>{labelB}</td>
      <td style={{ color: eq ? '#2e7d32' : '#b00', textAlign: 'center' }}>{String(eq)}</td>
      <td style={{ color: strict ? '#2e7d32' : '#b00', textAlign: 'center' }}>{String(strict)}</td>
      <td style={{ color: is ? '#2e7d32' : '#b00', textAlign: 'center', fontWeight: 600 }}>{String(is)}</td>
      <td style={{ textAlign: 'center' }}>{String(sameValueZero)}</td>
    </tr>
  );
}

function BailoutDemo() {
  const [renderCount, setRenderCount] = useState(0);
  const [value, setValue] = useState<number>(0);
  const renders = useRef(0);
  renders.current += 1;

  // Manual bailout using Object.is vs ===
  const setWithObjectIs = (next: number) => {
    if (Object.is(value, next)) {
      console.log(`Object.is(${String(value)}, ${String(next)}) -> true, bail out, no re-render`);
      return;
    }
    setValue(next);
    setRenderCount((c) => c + 1);
  };
  const setWithStrict = (next: number) => {
    if (next === value) {
      console.log(`=== ${String(value)} === ${String(next)} -> true, bail out`);
      return;
    }
    // This will incorrectly re-render for NaN
    setValue(next);
    setRenderCount((c) => c + 1);
  };

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginTop: 16 }}>
      <h3 style={{ margin: '4px 0' }}>React bailout: why NaN matters - renders: {renders.current}</h3>
      <div style={{ fontSize: 13, color: '#666' }}>
        value: <code>{String(value)}</code> | committed updates: {renderCount}
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setWithObjectIs(NaN)}>set NaN (Object.is)</button>
        <button onClick={() => setWithStrict(NaN)}>set NaN (===)</button>
        <button onClick={() => setWithObjectIs(0)}>set +0 (Object.is)</button>
        <button onClick={() => setWithObjectIs(-0)}>set -0 (Object.is)</button>
        <button onClick={() => setValue(0)}>reset to 0</button>
      </div>
      <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
        Try: click <code>set NaN (Object.is)</code> twice - second click bails out (no render). With <code>===</code>, it re-renders every time because <code>NaN === NaN</code> is false. Open console for logs.
      </div>
    </div>
  );
}

export default function App() {
  const [customA, setCustomA] = useState('0');
  const [customB, setCustomB] = useState('-0');

  const parse = (s: string) => {
    if (s === 'NaN') return NaN;
    if (s === '0') return 0;
    if (s === '-0') return -0;
    if (s === 'Infinity') return Infinity;
    if (s === '-Infinity') return -Infinity;
    const n = Number(s);
    return Number.isNaN(n) ? s : n;
  };
  const ca = parse(customA);
  const cb = parse(customB);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20, maxWidth: 750 }}>
      <h1>Object.is - SameValue Demo</h1>
      <p style={{ fontSize: 14, color: '#444' }}>
        Compare <code>==</code> vs <code>===</code> vs <code>Object.is</code> vs <code>SameValueZero</code> (Set/Map).{' '}
        <code>Object.is</code> is the only one where <code>NaN</code> equals <code>NaN</code> and <code>+0 !== -0</code>.
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f6f8fa', textAlign: 'left' }}>
            <th>a</th>
            <th>b</th>
            <th style={{ textAlign: 'center' }}>==</th>
            <th style={{ textAlign: 'center' }}>===</th>
            <th style={{ textAlign: 'center' }}>Object.is</th>
            <th style={{ textAlign: 'center' }}>Set/Map</th>
          </tr>
        </thead>
        <tbody>
          <Row a={NaN} b={NaN} labelA="NaN" labelB="NaN" />
          <Row a={0} b={-0} labelA="0" labelB="-0" />
          <Row a={0} b={0} labelA="0" labelB="0" />
          <Row a={-0} b={-0} labelA="-0" labelB="-0" />
          <Row a={1} b={'1' as any} labelA="1" labelB="'1'" />
          <Row a={null} b={undefined as any} labelA="null" labelB="undefined" />
          <Row a={{}} b={{}} labelA="{}" labelB="{} (different ref)" />
          <Row a={ca} b={cb} labelA={customA || '""'} labelB={customB || '""'} />
        </tbody>
      </table>

      <div style={{ marginTop: 12, fontSize: 13, background: '#f6f8fa', padding: 12, borderRadius: 8 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Custom: try NaN, 0, -0, 42, hello</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={customA} onChange={(e) => setCustomA(e.target.value)} placeholder="a" style={{ flex: 1, padding: 6 }} />
          <span>vs</span>
          <input value={customB} onChange={(e) => setCustomB(e.target.value)} placeholder="b" style={{ flex: 1, padding: 6 }} />
        </div>
        <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 13 }}>
          Object.is({customA || '""'}, {customB || '""'}) ={' '}
          <strong style={{ color: Object.is(ca, cb) ? '#2e7d32' : '#b00' }}>{String(Object.is(ca, cb))}</strong>
          {'  |  '} === = {String(ca === cb)}
          {'  |  '} == = {String(ca == cb)}
        </div>
        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
          1/0 = {String(1 / 0)} vs 1/-0 = {String(1 / -0)} - Object.is(1/0, 1/-0) = {String(Object.is(1 / 0, 1 / -0))}
        </div>
      </div>

      <BailoutDemo />

      <pre style={{ marginTop: 16, background: '#f6f8fa', padding: 12, fontSize: 12, borderRadius: 8 }}>
{`Object.is polyfill (spec):
function objectIs(a,b) {
  if (a === b) return a !== 0 || 1/a === 1/b; // handles -0
  return a !== a && b !== b; // handles NaN
}`}
      </pre>
    </div>
  );
}
