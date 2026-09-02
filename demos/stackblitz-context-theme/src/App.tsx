import { createContext, useContext, useState, useMemo } from 'react';

// 1. Create the pipe - holds theme + toggle
const ThemeContext = createContext<{ theme: string; toggle: () => void }>({
  theme: 'light',
  toggle: () => {},
});

// 2. Provider owns the state, publishes it
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light');
  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  // Memoize so consumers don't re-render when identity would otherwise change every render
  const value = useMemo(() => ({ theme, toggle }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <div className={theme}>{children}</div>
    </ThemeContext.Provider>
  );
}

// 3. Custom hook - clean consumption
function useTheme() {
  return useContext(ThemeContext);
}

// Deeply nested components - no props needed!
function Header() {
  const { theme } = useTheme();
  return <div className="card">Header - current theme: <strong>{theme}</strong></div>;
}

function Sidebar() {
  // This component doesn't use theme, but doesn't need to forward it either
  return (
    <div className="card">
      Sidebar (does not use theme, no prop drilling)
      <Avatar />
    </div>
  );
}

function Avatar() {
  const { theme } = useTheme();
  return <div className="card">Avatar - rendered as: <strong>{theme}</strong></div>;
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return <button onClick={toggle}>Toggle to {theme === 'light' ? 'dark' : 'light'}</button>;
}

function Layout() {
  return (
    <>
      <Header />
      <Sidebar />
      <ThemeToggle />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <h1>Context API - Theme Demo</h1>
      <p>App → Layout → Sidebar → Avatar : no prop drilling. All read via useContext.</p>
      <Layout />
      <p style={{ marginTop: 20, fontSize: 12, opacity: 0.7 }}>
        Try: Change ThemeContext value to see all consumers update. Add a new consumer anywhere - no prop changes.
      </p>
    </ThemeProvider>
  );
}
