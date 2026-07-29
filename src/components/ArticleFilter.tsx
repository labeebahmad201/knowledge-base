import {type ReactNode, useState, useMemo, useRef, useEffect} from 'react';
import Fuse from 'fuse.js';

interface Article {
  title: string
  path: string
  category: string
}

const articles: Article[] = [
  {title: 'Architecture by Neglect', path: '/docs/software-engineering/architecture-by-neglect', category: 'Architecture'},
  {title: 'Architecture is Not the Starting Point', path: '/docs/software-engineering/architecture-is-not-the-starting-point', category: 'Architecture'},
  {title: 'Cohesion: Capability vs Layer', path: '/docs/software-engineering/cohesion-capability-vs-layer', category: 'Architecture'},
  {title: 'Cross-Module Queries', path: '/docs/software-engineering/cross-module-queries', category: 'Architecture'},
  {title: 'Design & Architecture', path: '/docs/software-engineering/design-architecture', category: 'Architecture'},
  {title: 'Interface Implementation Pair', path: '/docs/software-engineering/interface-implementation-pair', category: 'Architecture'},
  {title: 'Microservices', path: '/docs/software-engineering/microservices', category: 'Architecture'},
  {title: 'Modular Monolith', path: '/docs/software-engineering/modular-monolith', category: 'Architecture'},
  {title: 'Monolith vs Microservices', path: '/docs/software-engineering/monolith-vs-microservices', category: 'Architecture'},
  {title: 'Monorepo', path: '/docs/software-engineering/monorepo', category: 'Architecture'},
  {title: 'Seams and Testability', path: '/docs/software-engineering/seams-and-testability', category: 'Architecture'},
  {title: 'Third-Party Coupling', path: '/docs/software-engineering/third-party-coupling', category: 'Architecture'},
  {title: 'When the Monolith Breaks', path: '/docs/software-engineering/when-the-monolith-breaks', category: 'Architecture'},
  {title: 'When to Abstract', path: '/docs/software-engineering/when-to-abstraction', category: 'Architecture'},
  {title: 'Integration Test Rollback', path: '/docs/software-engineering/integration-test-rollback', category: 'Testing'},
  {title: 'Testing a Modular Monolith', path: '/docs/software-engineering/testing-modular-monolith', category: 'Testing'},
  {title: 'Testing & Quality', path: '/docs/software-engineering/testing-quality', category: 'Testing'},
  {title: 'APIs & Distributed Systems', path: '/docs/software-engineering/apis-distributed-systems', category: 'Engineering'},
  {title: 'Backend', path: '/docs/software-engineering/backend', category: 'Engineering'},
  {title: 'Behavioral', path: '/docs/software-engineering/behavioral', category: 'Engineering'},
  {title: 'Caching, Messaging & Search', path: '/docs/software-engineering/caching-messaging-search', category: 'Engineering'},
  {title: 'DevOps', path: '/docs/software-engineering/devops', category: 'Engineering'},
  {title: 'Engineering Process', path: '/docs/software-engineering/engineering-process', category: 'Engineering'},
  {title: 'Frontend', path: '/docs/software-engineering/frontend', category: 'Engineering'},
  {title: 'Languages & Runtimes', path: '/docs/software-engineering/languages-runtimes', category: 'Engineering'},
  {title: 'Leadership', path: '/docs/software-engineering/leadership', category: 'Engineering'},
  {title: 'Observability', path: '/docs/software-engineering/observability', category: 'Engineering'},
  {title: 'Python Cheat Sheet', path: '/docs/software-engineering/python-cheat-sheet', category: 'Engineering'},
  {title: 'Reliability & Performance', path: '/docs/software-engineering/reliability-performance', category: 'Engineering'},
  {title: 'Security', path: '/docs/software-engineering/security', category: 'Engineering'},
  {title: 'System Design', path: '/docs/software-engineering/system-design', category: 'Engineering'},
];

const categoryOrder = ['Architecture', 'Testing', 'Engineering'];

const fuse = new Fuse(articles, {
  keys: ['title', 'category'],
  threshold: 0.4,
  distance: 100,
});

export default function ArticleFilter(): ReactNode {
  const [query, setQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).slice(0, 10).map((r) => r.item);
  }, [query]);

  const filtered = useMemo(() => {
    if (!query.trim()) return articles;
    const q = query.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q),
    );
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Article[]>();
    for (const a of filtered) {
      if (!map.has(a.category)) map.set(a.category, []);
      map.get(a.category)!.push(a);
    }
    return categoryOrder
      .filter((c) => map.has(c))
      .map((c) => ({category: c, items: map.get(c)!}));
  }, [filtered]);

  useEffect(() => {
    setFocusedIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      window.location.href = suggestions[focusedIndex].path;
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }

  return (
    <div style={{position: 'relative', marginBottom: '1.5rem'}}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search articles by title or category…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          fontSize: '1rem',
          border: '2px solid var(--ifm-color-emphasis-300)',
          borderRadius: '8px',
          outline: 'none',
          background: 'var(--ifm-background-color)',
          color: 'var(--ifm-font-color-base)',
          boxSizing: 'border-box',
        }}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={listRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--ifm-background-surface-color)',
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: '0 0 8px 8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {suggestions.map((a, i) => (
            <a
              key={a.path}
              href={a.path}
              onMouseEnter={() => setFocusedIndex(i)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.6rem 1rem',
                textDecoration: 'none',
                color: 'var(--ifm-font-color-base)',
                background:
                  i === focusedIndex
                    ? 'var(--ifm-hover-overlay)'
                    : 'transparent',
                fontSize: '0.95rem',
              }}
            >
              <span style={{fontWeight: 500}}>{a.title}</span>
              <span
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--ifm-color-emphasis-600)',
                  background: 'var(--ifm-color-emphasis-200)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                }}
              >
                {a.category}
              </span>
            </a>
          ))}
        </div>
      )}

      {!query.trim() ? null : suggestions.length === 0 && filtered.length === 0 ? (
        <p style={{color: 'var(--ifm-color-emphasis-600)', marginTop: '0.5rem'}}>
          No articles match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        grouped.map(({category, items}) => (
          <section key={category} style={{marginBottom: '2rem'}}>
            <h2>{category}</h2>
            <ul style={{paddingLeft: '1.25rem', margin: 0}}>
              {items.map((a) => (
                <li key={a.path} style={{marginBottom: '0.4rem'}}>
                  <a
                    href={a.path}
                    style={{fontWeight: 600, fontSize: '0.95rem'}}
                  >
                    {a.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
