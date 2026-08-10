import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';

interface Insight {
  title: string;
  tags: string[];
  date: string;
  body: string;
}

const insights: Insight[] = [
  {
    title: 'Monorepo is not a modular monolith',
    tags: ['Architecture'],
    date: 'Aug 2026',
    body: 'Putting each bounded context in its own app inside one repository does not give you a modular monolith. The repo layout is orthogonal to runtime: a monolith is one process, and one-context-per-app is a microservices deployment no matter which folder it lives in. A monorepo buys you atomic commits and shared code, never in-process calls.',
  },
  {
    title: 'Adapters hide transport, not semantics',
    tags: ['Architecture', 'DDD'],
    date: 'Aug 2026',
    body: 'Swapping an in-process adapter for a network adapter is not free. If the port is synchronous and transactional, a network implementation cannot honor both: latency changes by orders of magnitude, and the caller suddenly needs timeouts, retries, and eventual consistency. Design the port to be message-shaped from day one — commands and events over a bus — so the transport is genuinely interchangeable.',
  },
  {
    title: 'Boundaries come from language, deployment from scale',
    tags: ['Architecture', 'DDD'],
    date: 'Aug 2026',
    body: 'Bounded contexts are drawn where language, rules, or actors change. Deployment is a separate decision made for independent scaling or independent teams. Split deployables only for those two reasons; otherwise keep the contexts as modules inside one deployable. Splitting without a reason just buys you a distributed monolith.',
  },
  {
    title: 'The one rule that survived boundary-drawing',
    tags: ['DDD', 'Event Storming'],
    date: 'Aug 2026',
    body: 'When the event storming timeline is regrouped into contexts, the order does not vanish. It survives in two places: the internal sequence of events inside each context, and the boundary events that pass between contexts. What changes is that a single word may now be used with two different meanings in two different contexts.',
  },
  {
    title: 'Two forces pull every boundary',
    tags: ['DDD', 'Architecture'],
    date: 'Aug 2026',
    body: 'Cohesion pulls a boundary outward — things that change together belong together. The boundary pulls it inward — where language, rules, or actors change, draw the line. The tension to manage is between "these change together" and "these say the same word but mean different things." A boundary is only worth drawing when it survives both pulls.',
  },
  {
    title: 'One rule applies to events, not to nouns',
    tags: ['DDD'],
    date: 'Aug 2026',
    body: 'An aggregate like Order appears in many contexts, but those are separate copies — never one shared model. The rule "one model per context" governs events and the concepts they express, not the nouns. Merging the copies is what turns contextual flexibility back into a global model.',
  },
  {
    title: 'Event storming events are discovery tools, not code events',
    tags: ['DDD', 'Event Storming'],
    date: 'Aug 2026',
    body: 'Most orange stickies from event storming become method calls, not emitted domain events. Events exist only when another aggregate or context needs to react — cross-aggregate side effects, not intra-aggregate state changes. Brandolini: "It\'s the developer understanding, not the expert knowledge, that becomes working code." The workshop produces discovery; the developer decides what becomes a communication mechanism.',
  },
];

function InsightCard({insight}: {insight: Insight}) {
  return (
    <div
      className="card"
      style={{
        padding: '1.5rem 1.75rem',
        borderRadius: '12px',
        background: 'var(--ifm-card-background-color)',
        border: '1px solid var(--ifm-color-emphasis-200)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap'}}>
        {insight.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--ifm-color-primary)',
              backgroundColor: 'var(--ifm-color-primary-contrast-background)',
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
            }}
          >
            {tag}
          </span>
        ))}
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '0.75rem',
            color: 'var(--ifm-color-emphasis-500)',
            whiteSpace: 'nowrap',
          }}
        >
          {insight.date}
        </span>
      </div>
      <h3 style={{margin: '0 0 0.5rem', fontWeight: 700, fontSize: '1.1rem'}}>{insight.title}</h3>
      <p style={{margin: 0, color: 'var(--ifm-color-emphasis-700)', fontSize: '0.95rem', lineHeight: 1.6}}>
        {insight.body}
      </p>
    </div>
  );
}

export default function Insights(): ReactNode {
  return (
    <Layout title="Insights" description="Short, high-signal observations on software and architecture">
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
        <h1 style={{fontSize: '2.25rem', margin: 0, fontWeight: 800, letterSpacing: '-0.03em'}}>Insights</h1>
        <p style={{fontSize: '1.1rem', marginTop: '0.75rem', opacity: 0.85, fontWeight: 400, maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto'}}>
          Short observations that are too small for a full article — and too important to bury inside one.
        </p>
      </header>
      <main>
        <div style={{maxWidth: '1100px', margin: '0 auto', padding: '3rem 1rem 4rem'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem'}}>
            {insights.map((insight) => (
              <InsightCard key={insight.title} insight={insight} />
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}