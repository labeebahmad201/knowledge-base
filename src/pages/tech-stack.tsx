import type {ReactNode} from 'react';
import {useState} from 'react';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';

interface TechItem {
  name: string;
  problem: string;
}

const techStack: Record<string, TechItem[]> = {
  Languages: [
    {name: 'TypeScript', problem: 'Primary language for web applications'},
    {name: 'Python', problem: 'Data engineering, scripting, AI/ML'},
    {name: 'Go', problem: 'High-performance services, CLI tools'},
  ],
  Frontend: [
    {name: 'React', problem: 'UI component library for web apps'},
    {name: 'Next.js', problem: 'Full-stack React framework with SSR'},
    {name: 'Tailwind CSS', problem: 'Utility-first CSS framework'},
  ],
  Backend: [
    {name: 'NestJS', problem: 'TypeScript backend framework with DI, modular architecture'},
    {name: 'Express', problem: 'Minimal Node.js web framework'},
    {name: 'FastAPI', problem: 'Python async web framework'},
  ],
  Databases: [
    {name: 'PostgreSQL', problem: 'Primary relational database'},
    {name: 'Redis', problem: 'Caching, session store, task queue'},
    {name: 'MongoDB', problem: 'Document store for flexible schemas'},
  ],
  Infrastructure: [
    {name: 'Docker', problem: 'Containerization for consistent environments'},
    {name: 'Kubernetes', problem: 'Container orchestration at scale'},
    {name: 'GitHub Actions', problem: 'CI/CD pipelines'},
  ],
  Architecture: [
    {name: 'DDD', problem: 'Domain modeling, bounded contexts, aggregates'},
    {name: 'CQRS', problem: 'Separate read and write models'},
    {name: 'Event Sourcing', problem: 'Immutable event log as source of truth'},
    {name: 'Modular Monolith', problem: 'Single deployable with module boundaries'},
  ],
  Testing: [
    {name: 'Jest', problem: 'JavaScript testing framework'},
    {name: 'Playwright', problem: 'End-to-end browser testing'},
    {name: 'k6', problem: 'Load testing and performance benchmarking'},
  ],
  DevOps: [
    {name: 'Nginx', problem: 'Reverse proxy, load balancer'},
    {name: 'Prometheus', problem: 'Metrics collection and alerting'},
    {name: 'Grafana', problem: 'Metrics visualization dashboards'},
  ],
  Messaging: [
    {name: 'Kafka', problem: 'Event streaming, async communication between modules'},
    {name: 'RabbitMQ', problem: 'Message broker for task queues'},
    {name: 'BullMQ', problem: 'Redis-based job queue for Node.js'},
  ],
  Auth: [
    {name: 'OAuth 2.0', problem: 'Standard authorization protocol'},
    {name: 'JWT', problem: 'Token-based authentication'},
    {name: 'Passport.js', problem: 'Authentication middleware for Node.js'},
  ],
  Monitoring: [
    {name: 'OpenTelemetry', problem: 'Distributed tracing and observability'},
    {name: 'Sentry', problem: 'Error tracking and performance monitoring'},
  ],
};

const categories = Object.keys(techStack);

export default function TechStack(): ReactNode {
  const [filter, setFilter] = useState<string | null>(null);
  const filtered = filter ? {[filter]: techStack[filter]} : techStack;

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
          Technologies to learn and problems to solve.
        </p>
      </header>
      <main>
        <div style={{maxWidth: '800px', margin: '0 auto', padding: '3rem 1rem 4rem'}}>
          <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2.5rem'}}>
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

          {Object.entries(filtered).map(([category, items]) => (
            <section key={category} style={{marginBottom: '2.5rem'}}>
              <h2
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--ifm-color-emphasis-500)',
                  margin: '0 0 1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid var(--ifm-color-emphasis-200)',
                }}
              >
                {category}
              </h2>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                {items.map((item) => (
                  <div
                    key={item.name}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '1rem',
                      padding: '0.6rem 0',
                      borderBottom: '1px solid var(--ifm-color-emphasis-100)',
                    }}
                  >
                    <span style={{fontWeight: 600, fontSize: '0.95rem', minWidth: '140px', flexShrink: 0}}>
                      {item.name}
                    </span>
                    <span style={{fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)'}}>
                      {item.problem}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </Layout>
  );
}
