import type {ReactNode} from 'react';
import {useState} from 'react';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';

interface RoadmapItem {
  name: string;
  problem: string;
}

const roadmap: Record<string, RoadmapItem[]> = {
  'Languages & Frameworks': [
    {name: 'TypeScript', problem: 'Primary language for web applications'},
    {name: 'Python', problem: 'Data engineering, scripting, AI/ML'},
    {name: 'Go', problem: 'High-performance services, CLI tools'},
    {name: 'React', problem: 'UI component library for web apps'},
    {name: 'Next.js', problem: 'Full-stack React framework with SSR'},
    {name: 'NestJS', problem: 'TypeScript backend framework with DI, modular architecture'},
    {name: 'FastAPI', problem: 'Python async web framework'},
  ],
  Databases: [
    {name: 'PostgreSQL', problem: 'Primary relational database'},
    {name: 'Redis', problem: 'Caching, session store, task queue'},
    {name: 'MongoDB', problem: 'Document store for flexible schemas'},
    {name: 'Prisma / Drizzle', problem: 'Type-safe database access layer'},
  ],
  Infrastructure: [
    {name: 'Docker', problem: 'Containerization for consistent environments'},
    {name: 'Kubernetes', problem: 'Container orchestration at scale'},
    {name: 'GitHub Actions', problem: 'CI/CD pipelines'},
    {name: 'Nginx', problem: 'Reverse proxy, load balancer'},
    {name: 'Prometheus + Grafana', problem: 'Metrics collection and visualization'},
  ],
  'Architecture Patterns': [
    {name: 'Modular Monolith', problem: 'Single deployable with module boundaries'},
    {name: 'Microservices', problem: 'Independent services with separate deployments'},
    {name: 'Event-Driven Architecture', problem: 'Async communication via events'},
    {name: 'CQRS', problem: 'Separate read and write models'},
    {name: 'Event Sourcing', problem: 'Immutable event log as source of truth'},
    {name: 'Hexagonal Architecture', problem: 'Ports and adapters, isolate core logic'},
    {name: 'Layered Architecture', problem: 'Traditional controller → service → repository'},
  ],
  'Design Patterns': [
    {name: 'SOLID Principles', problem: 'Five principles for maintainable OOP code'},
    {name: 'Repository Pattern', problem: 'Abstract data access from business logic'},
    {name: 'Factory Pattern', problem: 'Delegate object creation to subclasses or factories'},
    {name: 'Strategy Pattern', problem: 'Swap algorithms at runtime without changing context'},
    {name: 'Observer Pattern', problem: 'Publish-subscribe for loose coupling'},
    {name: 'Decorator Pattern', problem: 'Add behavior dynamically without inheritance'},
    {name: 'Dependency Injection', problem: 'Invert control, inject dependencies instead of creating'},
  ],
  'Domain Modeling': [
    {name: 'DDD', problem: 'Domain modeling, bounded contexts, aggregates'},
    {name: 'Event Storming', problem: 'Collaborative discovery of domain events and flows'},
    {name: 'Aggregates', problem: 'Consistency boundaries within a bounded context'},
    {name: 'Value Objects', problem: 'Immutable objects defined by attributes, not identity'},
    {name: 'Domain Events', problem: 'Capture side effects of state changes'},
    {name: 'Anti-Corruption Layer', problem: 'Translate between external and internal models'},
  ],
  'Software Engineering': [
    {name: 'Code That Can Be Changed', problem: 'The only code that matters is code that can be changed'},
    {name: 'Accidental vs Essential Complexity', problem: 'Distinguish complexity the domain forces from complexity we created'},
    {name: 'Coupling & Cohesion', problem: 'Low coupling, high cohesion - modules that change together live together'},
    {name: 'Premature Abstraction', problem: 'Wrong abstraction costs more than duplication - wait until you see three'},
    {name: 'YAGNI', problem: 'You are not gonna need it - build only what is required now'},
    {name: 'Separation of Concerns', problem: 'Each module should have a single reason to change'},
    {name: 'Fail Fast', problem: 'Surface errors immediately instead of allowing corrupt state to spread'},
    {name: 'Convention over Configuration', problem: 'Reduce decisions by having sensible defaults'},
    {name: 'Symmetric Encryption', problem: 'Same key for encrypt and decrypt - shared secrets, not public/private'},
    {name: 'API Versioning', problem: 'Break changes without breaking clients - version your contracts'},
    {name: 'Stateless Services', problem: 'No in-memory state across requests - scale horizontally, retry safely'},
    {name: 'Idempotency', problem: 'Same request twice gives the same result - safe retries, safe webhooks'},
    {name: 'Graceful Degradation', problem: 'When one part fails, the rest still works'},
    {name: 'Observability vs Monitoring', problem: 'Monitoring tells you something is wrong, observability tells you why'},
  ],
  Testing: [
    {name: 'Unit Testing', problem: 'Test individual functions or classes in isolation'},
    {name: 'Integration Testing', problem: 'Test how modules work together'},
    {name: 'End-to-End Testing', problem: 'Test full user flows through the browser'},
    {name: 'Contract Testing', problem: 'Verify API contracts between services'},
    {name: 'Load Testing', problem: 'Find performance bottlenecks under stress'},
  ],
  'Developer Workflow': [
    {name: 'Git Branching Strategies', problem: 'Git flow, trunk-based, feature flags'},
    {name: 'Code Reviews', problem: 'Effective review process, giving and receiving feedback'},
    {name: 'Refactoring', problem: 'Improve code without changing behavior'},
    {name: 'Technical Debt Management', problem: 'Track, prioritize, and pay down debt'},
    {name: 'Static Analysis / Linting', problem: 'Enforce code quality automatically'},
    {name: 'Observability', problem: 'Logs, metrics, traces - understand what is happening'},
  ],
  'Product & Business': [
    {name: 'Ideal Customer Profile', problem: 'Define who you are building for and why'},
    {name: 'Problem-Solution Fit', problem: 'Validate the problem before building the solution'},
    {name: 'MVP Strategy', problem: 'Smallest thing you can build to learn something'},
    {name: 'Pricing & Monetization', problem: 'Free trial, freemium, usage-based, seat-based'},
    {name: 'Go-to-Market', problem: 'How to reach and convert your first customers'},
    {name: 'Retention & Growth', problem: 'Activation, engagement, reducing churn'},
    {name: 'Product-Market Fit', problem: 'When the product sells itself without you pushing'},
    {name: 'Feedback Loops', problem: 'Collect, prioritize, and act on user feedback'},
  ],
  'System Design': [
    {name: 'API Design', problem: 'REST, GraphQL, gRPC - choosing and designing APIs'},
    {name: 'Authentication & Authorization', problem: 'OAuth, JWT, RBAC, session management'},
    {name: 'Caching Strategies', problem: 'When and where to cache for performance'},
    {name: 'Message Queues', problem: 'Async processing with Kafka, RabbitMQ, BullMQ'},
    {name: 'Rate Limiting & Throttling', problem: 'Protect services from overload'},
    {name: 'Database Scaling', problem: 'Sharding, read replicas, connection pooling'},
  ],
};

const categories = Object.keys(roadmap);

export default function TechStack(): ReactNode {
  const [filter, setFilter] = useState<string | null>(null);
  const filtered = filter ? {[filter]: roadmap[filter]} : roadmap;

  return (
    <Layout title="Roadmap" description="Developer roadmap - skills, patterns, and product knowledge">
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
        <h1 style={{fontSize: '2.25rem', margin: 0, fontWeight: 800, letterSpacing: '-0.03em'}}>Roadmap</h1>
        <p style={{fontSize: '1.1rem', marginTop: '0.75rem', opacity: 0.85, fontWeight: 400, maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto'}}>
          What to learn, what to know, and what problems each thing solves.
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
                    <span style={{fontWeight: 600, fontSize: '0.95rem', minWidth: '160px', flexShrink: 0}}>
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
