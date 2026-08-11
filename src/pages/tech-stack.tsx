import type {ReactNode} from 'react';
import {useState} from 'react';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';

interface TechItem {
  name: string;
  category: string;
  status: 'to-learn' | 'learning' | 'done';
  problem: string;
}

const techStack: TechItem[] = [
  // Languages
  {name: 'TypeScript', category: 'Languages', status: 'learning', problem: 'Primary language for web applications'},
  {name: 'Python', category: 'Languages', status: 'to-learn', problem: 'Data engineering, scripting, AI/ML'},
  {name: 'Go', category: 'Languages', status: 'to-learn', problem: 'High-performance services, CLI tools'},

  // Frontend
  {name: 'React', category: 'Frontend', status: 'to-learn', problem: 'UI component library for web apps'},
  {name: 'Next.js', category: 'Frontend', status: 'to-learn', problem: 'Full-stack React framework with SSR'},
  {name: 'Tailwind CSS', category: 'Frontend', status: 'to-learn', problem: 'Utility-first CSS framework'},

  // Backend
  {name: 'NestJS', category: 'Backend', status: 'to-learn', problem: 'TypeScript backend framework with DI, modular architecture'},
  {name: 'Express', category: 'Backend', status: 'to-learn', problem: 'Minimal Node.js web framework'},
  {name: 'FastAPI', category: 'Backend', status: 'to-learn', problem: 'Python async web framework'},

  // Databases
  {name: 'PostgreSQL', category: 'Databases', status: 'to-learn', problem: 'Primary relational database'},
  {name: 'Redis', category: 'Databases', status: 'to-learn', problem: 'Caching, session store, task queue'},
  {name: 'MongoDB', category: 'Databases', status: 'to-learn', problem: 'Document store for flexible schemas'},

  // Infrastructure
  {name: 'Docker', category: 'Infrastructure', status: 'to-learn', problem: 'Containerization for consistent environments'},
  {name: 'Kubernetes', category: 'Infrastructure', status: 'to-learn', problem: 'Container orchestration at scale'},
  {name: 'GitHub Actions', category: 'Infrastructure', status: 'to-learn', problem: 'CI/CD pipelines'},

  // Architecture
  {name: 'DDD', category: 'Architecture', status: 'done', problem: 'Domain modeling, bounded contexts, aggregates'},
  {name: 'CQRS', category: 'Architecture', status: 'done', problem: 'Separate read and write models'},
  {name: 'Event Sourcing', category: 'Architecture', status: 'to-learn', problem: 'Immutable event log as source of truth'},
  {name: 'Modular Monolith', category: 'Architecture', status: 'done', problem: 'Single deployable with module boundaries'},

  // Testing
  {name: 'Jest', category: 'Testing', status: 'to-learn', problem: 'JavaScript testing framework'},
  {name: 'Playwright', category: 'Testing', status: 'to-learn', problem: 'End-to-end browser testing'},
  {name: 'k6', category: 'Testing', status: 'to-learn', problem: 'Load testing and performance benchmarking'},

  // DevOps
  {name: 'Nginx', category: 'DevOps', status: 'to-learn', problem: 'Reverse proxy, load balancer'},
  {name: 'Prometheus', category: 'DevOps', status: 'to-learn', problem: 'Metrics collection and alerting'},
  {name: 'Grafana', category: 'DevOps', status: 'to-learn', problem: 'Metrics visualization dashboards'},

  // Messaging
  {name: 'Kafka', category: 'Messaging', status: 'to-learn', problem: 'Event streaming, async communication between modules'},
  {name: 'RabbitMQ', category: 'Messaging', status: 'to-learn', problem: 'Message broker for task queues'},
  {name: 'BullMQ', category: 'Messaging', status: 'to-learn', problem: 'Redis-based job queue for Node.js'},

  // Auth
  {name: 'OAuth 2.0', category: 'Auth', status: 'to-learn', problem: 'Standard authorization protocol'},
  {name: 'JWT', category: 'Auth', status: 'to-learn', problem: 'Token-based authentication'},
  {name: 'Passport.js', category: 'Auth', status: 'to-learn', problem: 'Authentication middleware for Node.js'},

  // Monitoring
  {name: 'OpenTelemetry', category: 'Monitoring', status: 'to-learn', problem: 'Distributed tracing and observability'},
  {name: 'Sentry', category: 'Monitoring', status: 'to-learn', problem: 'Error tracking and performance monitoring'},
];

const statusColors: Record<string, {bg: string; text: string}> = {
  'to-learn': {bg: 'var(--ifm-color-emphasis-100)', text: 'var(--ifm-color-emphasis-700)'},
  learning: {bg: '#ffe680', text: '#333'},
  done: {bg: '#6f6', text: '#333'},
};

const statusLabels: Record<string, string> = {
  'to-learn': 'To Learn',
  learning: 'Learning',
  done: 'Done',
};

function TechCard({item}: {item: TechItem}) {
  const colors = statusColors[item.status];
  return (
    <div
      className="card"
      style={{
        padding: '1rem 1.25rem',
        borderRadius: '10px',
        background: 'var(--ifm-card-background-color)',
        border: '1px solid var(--ifm-color-emphasis-200)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{fontWeight: 700, fontSize: '0.95rem'}}>{item.name}</span>
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: colors.text,
            backgroundColor: colors.bg,
            padding: '0.2rem 0.5rem',
            borderRadius: '999px',
          }}
        >
          {statusLabels[item.status]}
        </span>
      </div>
      <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)', lineHeight: 1.5}}>
        {item.problem}
      </p>
    </div>
  );
}

export default function TechStack(): ReactNode {
  const [filter, setFilter] = useState<string | null>(null);
  const categories = [...new Set(techStack.map((t) => t.category))].sort();
  const filtered = filter ? techStack.filter((t) => t.category === filter) : techStack;

  const toLearn = techStack.filter((t) => t.status === 'to-learn').length;
  const learning = techStack.filter((t) => t.status === 'learning').length;
  const done = techStack.filter((t) => t.status === 'done').length;

  return (
    <Layout title="Tech Stack" description="Tech stack roadmap and learning plan">
      <Head>
        <meta name="robots" content="index, follow" />
      </Head>
      <header
        style={{
          textAlign: 'center',
          padding: '4rem 1rem 3rem',
          borderBottom: '1px solid var(--ifm-color-emphasis-200)',
        }}
      >
        <h1 style={{fontSize: '2.25rem', margin: 0, fontWeight: 800, letterSpacing: '-0.03em'}}>Tech Stack Roadmap</h1>
        <p style={{fontSize: '1.1rem', marginTop: '0.75rem', opacity: 0.85, fontWeight: 400, maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto'}}>
          Technologies to learn, problems to solve, and progress so far.
        </p>
        <div style={{display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1.5rem', fontSize: '0.9rem'}}>
          <span><strong style={{color: 'var(--ifm-color-emphasis-500)'}}>To Learn:</strong> {toLearn}</span>
          <span><strong style={{color: '#b8860b'}}>Learning:</strong> {learning}</span>
          <span><strong style={{color: '#2d7d2d'}}>Done:</strong> {done}</span>
        </div>
      </header>
      <main>
        <div style={{maxWidth: '1100px', margin: '0 auto', padding: '3rem 1rem 4rem'}}>
          <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem'}}>
            <button
              onClick={() => setFilter(null)}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: filter === null ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-600)',
                backgroundColor: filter === null
                  ? 'var(--ifm-color-primary-contrast-background)'
                  : 'var(--ifm-color-emphasis-100)',
                border: 'none',
                padding: '0.35rem 0.8rem',
                borderRadius: '999px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(filter === cat ? null : cat)}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: filter === cat ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-600)',
                  backgroundColor: filter === cat
                    ? 'var(--ifm-color-primary-contrast-background)'
                    : 'var(--ifm-color-emphasis-100)',
                  border: 'none',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem'}}>
            {filtered.map((item) => (
              <TechCard key={item.name} item={item} />
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}
