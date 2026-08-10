import {type ReactNode, useState, useMemo} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

interface Article {
  title: string
  path: string
  category: string
}

const articles: Article[] = [
  {title: 'Architecture by Neglect', path: '/docs/software-engineering/architecture-by-neglect', category: 'Architecture'},
  {title: 'The Real Justification for Boundaries', path: '/docs/software-engineering/real-justification-for-boundaries', category: 'Architecture'},
  {title: 'Architecture is Not the Starting Point', path: '/docs/software-engineering/architecture-is-not-the-starting-point', category: 'Architecture'},
  {title: 'Architecture Decision Records', path: '/docs/software-engineering/architecture-decision-records', category: 'Architecture'},
  {title: 'Abstractions Must Earn Their Place', path: '/docs/software-engineering/abstractions-are-contextual', category: 'Architecture'},
  {title: 'Cohesion: Capability vs Layer', path: '/docs/software-engineering/cohesion-capability-vs-layer', category: 'Architecture'},
  {title: 'Cross-Module Queries', path: '/docs/software-engineering/cross-module-queries', category: 'Architecture'},
  {title: 'Decoupling Moves Complexity', path: '/docs/software-engineering/decoupling-moves-complexity', category: 'Architecture'},
  {title: 'Decoupling Case Studies: When to Apply Each Level', path: '/docs/software-engineering/decoupling-case-studies', category: 'Architecture'},
  {title: 'Deployment is a Configuration Choice (If You Have Boundaries)', path: '/docs/software-engineering/deployment-configuration-choice', category: 'Architecture'},
  {title: 'From Event Storming to Bounded Contexts', path: '/docs/software-engineering/event-storming-read-models-boundaries', category: 'Architecture'},

  {title: 'DDD: The Complete Process Step by Step', path: '/docs/software-engineering/ddd-process', category: 'DDD'},
  {title: 'From Event Storming to Bounded Contexts (DDD)', path: '/docs/software-engineering/event-storming-read-models-boundaries', category: 'DDD'},
  {title: 'Aggregate Sizing: How Big Should an Aggregate Be?', path: '/docs/software-engineering/aggregate-sizing', category: 'DDD'},
  {title: 'Transaction Locking: How Two Updates Block Each Other', path: '/docs/software-engineering/transaction-locking', category: 'DDD'},
  {title: 'Aggregates and Bounded Contexts', path: '/docs/software-engineering/aggregates-and-boundaries', category: 'DDD'},
  {title: 'Bounded Contexts', path: '/docs/software-engineering/bounded-contexts', category: 'DDD'},
  {title: 'One Model Per Context', path: '/docs/software-engineering/one-model-per-context', category: 'DDD'},

  {title: 'Interface Implementation Pair', path: '/docs/software-engineering/interface-implementation-pair', category: 'Architecture'},
  {title: 'Microservices', path: '/docs/software-engineering/microservices', category: 'Architecture'},
  {title: 'Modular Monolith', path: '/docs/software-engineering/modular-monolith', category: 'Architecture'},
  {title: 'Module Wiring: Ports and Adapters', path: '/docs/software-engineering/module-wiring-ports-adapters', category: 'Architecture'},
  {title: 'MVC: When the Request-Response Shape Fits', path: '/docs/software-engineering/mvc-when-to-use', category: 'Architecture'},
  {title: 'Monolith vs Microservices', path: '/docs/software-engineering/monolith-vs-microservices', category: 'Architecture'},
  {title: 'Monorepo', path: '/docs/software-engineering/monorepo', category: 'Architecture'},
  {title: 'One Model Per Context', path: '/docs/software-engineering/one-model-per-context', category: 'Architecture'},
  {title: 'Seams and Testability', path: '/docs/software-engineering/seams-and-testability', category: 'Architecture'},
  {title: 'Third-Party Coupling', path: '/docs/software-engineering/third-party-coupling', category: 'Architecture'},
  {title: 'What Makes Coupling Loose', path: '/docs/software-engineering/what-makes-coupling-loose', category: 'Architecture'},
  {title: 'When the Monolith Breaks', path: '/docs/software-engineering/when-the-monolith-breaks', category: 'Architecture'},
  {title: 'When to Abstract', path: '/docs/software-engineering/when-to-abstraction', category: 'Architecture'},
  {title: 'Integration Test Rollback', path: '/docs/software-engineering/integration-test-rollback', category: 'Testing'},
  {title: 'Testing a Modular Monolith', path: '/docs/software-engineering/testing-modular-monolith', category: 'Testing'},
  {title: 'Testing & Quality', path: '/docs/software-engineering/testing-quality', category: 'Testing'},
  {title: 'APIs & Distributed Systems', path: '/docs/software-engineering/apis-distributed-systems', category: 'Engineering'},
  {title: 'Backend', path: '/docs/software-engineering/backend', category: 'Engineering'},
  {title: 'Capability-First Design', path: '/docs/software-engineering/capability-first-design', category: 'Architecture'},
  {title: 'Behavioral', path: '/docs/software-engineering/behavioral', category: 'Engineering'},
  {title: 'Caching, Messaging & Search', path: '/docs/software-engineering/caching-messaging-search', category: 'Engineering'},
  {title: 'DevOps', path: '/docs/software-engineering/devops', category: 'Engineering'},
  {title: 'Engineering Process', path: '/docs/software-engineering/engineering-process', category: 'Engineering'},
  {title: 'Frontend', path: '/docs/software-engineering/frontend', category: 'Engineering'},
  {title: 'Git Squash and Merge', path: '/docs/software-engineering/git-squash-and-merge', category: 'Engineering'},
  {title: 'Delete Branch After Merge', path: '/docs/software-engineering/delete-branch-after-merge', category: 'Engineering'},
  {title: 'Languages & Runtimes', path: '/docs/software-engineering/languages-runtimes', category: 'Engineering'},
  {title: 'Leadership', path: '/docs/software-engineering/leadership', category: 'Engineering'},
  {title: 'Observability', path: '/docs/software-engineering/observability', category: 'Engineering'},
  {title: 'Python Cheat Sheet', path: '/docs/software-engineering/python-cheat-sheet', category: 'Engineering'},
  {title: 'Reliability & Performance', path: '/docs/software-engineering/reliability-performance', category: 'Engineering'},
  {title: 'Security', path: '/docs/software-engineering/security', category: 'Engineering'},
  {title: 'System Design', path: '/docs/software-engineering/system-design', category: 'Engineering'},
  {title: 'DDIA: Designing Data-Intensive Applications', path: '/docs/software-engineering/books/ddia', category: 'Books'},

  {title: 'The AI Application Stack', path: '/docs/software-engineering/ai-application-stack', category: 'AI'},
];

const categoryOrder = ['Architecture', 'Testing', 'Engineering', 'Books', 'AI', 'DDD'];

export default function ArticleFilter(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const baseUrl = siteConfig.baseUrl;
  const [query, setQuery] = useState('');

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

  return (
    <div style={{position: 'relative', marginBottom: '1.5rem'}}>
      <input
        type="text"
        placeholder="Search articles by title or category…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
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

      {query.trim() && filtered.length === 0 ? (
        <p style={{color: 'var(--ifm-color-emphasis-600)', marginTop: '0.75rem'}}>
          No articles match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div style={{marginTop: '1.25rem'}}>
          {grouped.map(({category, items}) => (
            <section key={category} style={{marginBottom: '2rem'}}>
              <h2>{category}</h2>
              <ol style={{paddingLeft: '1.25rem', margin: 0}}>
                {items.map((a) => (
                  <li key={a.path} style={{marginBottom: '0.4rem'}}>
                    <a
                      href={`${baseUrl}${a.path.replace(/^\//, '')}`}
                      style={{fontWeight: 600, fontSize: '0.95rem'}}
                    >
                      {a.title}
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
