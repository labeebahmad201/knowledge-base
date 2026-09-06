import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function Roadmap() {
  return (
    <Layout title="Roadmap - Top 20% for $60/hr" description="Graphical roadmap - top 20% essential to land $60/hr jobs">
      <div className="container margin-vert--lg">
        <h1>Backend Roadmap - Top 20% for $60/hr</h1>
        <p>
          Gold nodes are the <strong>51 essential topics (top 20% of 257)</strong> that get you to <strong>$60/hr</strong>. The rest (206 topics) take you to $120/hr+. Click any node to open its Why-First article with runnable playground.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
          <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 16, height: 16, background: '#ffd700', border: '1px solid #333', display: 'inline-block' }} /> Top 20% - $60/hr essential</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 16, height: 16, background: '#e3f2fd', border: '1px solid #333', display: 'inline-block' }} /> Next 80% - senior deep dives</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff9c4', border: '2px solid #f9a825', borderRadius: 8, padding: 16 }}>
              <div style={{ fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>Top 20% - $60/hr Essential (51 topics) - Gold</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                <div style={{ background: '#ffd700', border: '1px solid #333', borderRadius: 6, padding: '8px 12px', width: '90%', textAlign: 'center' }}><strong>0. Core 10</strong><br/>API Design, SQL, Indexing, Caching, Auth, Queues, System Design, Concurrency, Docker, Observability</div>
                <div>↓</div>
                <div style={{ background: '#ffd700', border: '1px solid #333', borderRadius: 6, padding: '8px 12px', width: '90%', textAlign: 'center' }}><strong>1. SQL Core 10</strong><br/>SELECT/JOIN/GROUP BY, DISTINCT, Subquery, Window, Transactions</div>
                <div>↓</div>
                <div style={{ background: '#ffd700', border: '1px solid #333', borderRadius: 6, padding: '8px 12px', width: '90%', textAlign: 'center' }}><strong>3. API Design 3</strong><br/>REST, Idempotency, Rate Limiting</div>
                <div>↓</div>
                <div style={{ background: '#ffd700', border: '1px solid #333', borderRadius: 6, padding: '8px 12px', width: '90%', textAlign: 'center' }}><strong>7. Security 5</strong><br/>JWT/OAuth, SQL Injection, CORS, bcrypt, HTTPS</div>
                <div>↓</div>
                <div style={{ background: '#ffd700', border: '1px solid #333', borderRadius: 6, padding: '8px 12px', width: '90%', textAlign: 'center' }}><strong>6. System Design 5</strong><br/>Load Balancing, CDN, Caching, CAP, Consistent Hashing</div>
              </div>
            </div>
            <div style={{ textAlign: 'center', fontSize: 20 }}>↓</div>
            <div style={{ background: '#e3f2fd', border: '1px solid #1565c0', borderRadius: 8, padding: 16 }}>
              <div style={{ fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>Next 80% - $100+/hr Deep Dives (206 topics) - Blue</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                <div style={{ background: 'white', border: '1px solid #333', borderRadius: 6, padding: '8px 12px', width: '90%', textAlign: 'center' }}>Database Deep Dives<br/>OLTP/OLAP, WAL, Replication</div>
                <div>↓</div>
                <div style={{ background: 'white', border: '1px solid #333', borderRadius: 6, padding: '8px 12px', width: '90%', textAlign: 'center' }}>Caching & Storage<br/>Cache Stampede, Bloom Filters</div>
                <div>↓</div>
                <div style={{ background: 'white', border: '1px solid #333', borderRadius: 6, padding: '8px 12px', width: '90%', textAlign: 'center' }}>Distributed 13<br/>Event Sourcing, Saga, Bulkhead</div>
                <div>↓</div>
                <div style={{ background: 'white', border: '1px solid #333', borderRadius: 6, padding: '8px 12px', width: '90%', textAlign: 'center' }}>Production 12<br/>Circuit Breaker, Dead Letter Queue</div>
                <div>↓</div>
                <div style={{ background: 'white', border: '1px solid #333', borderRadius: 6, padding: '8px 12px', width: '90%', textAlign: 'center' }}>Senior Java 40<br/>JVM, Akka, Paxos/Raft</div>
                <div>↓</div>
                <div style={{ background: 'white', border: '1px solid #333', borderRadius: 6, padding: '8px 12px', width: '90%', textAlign: 'center' }}>Concurrency 20<br/>Mutex, CAS, Deadlock, Thread Pool</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <h2>How to use this roadmap</h2>
          <ol>
            <li><strong>Start with gold (top 20%)</strong> - 3 topics/day deep (Why-First + runnable playground). That's 51 topics in ~17 days at 3/day, or 10 days at 5/day if intensive.</li>
            <li>Each gold node links to its article: <Link to="/docs/software-engineering/sql-introduction">SQL Intro (28 topics done)</Link>, <Link to="/docs/api/rest">REST APIs</Link>, etc.</li>
            <li>Check off as you go - the gym retains the skill. Then tackle the blue deep dives as you build the mono-repo.</li>
          </ol>

          <h3>Full list</h3>
          <p>
            <Link to="/docs/software-engineering/backend-master-roadmap">View the full 257-topic checklist</Link> with Why-First for each topic.
          </p>

          <h3>Progress</h3>
          <ul>
            <li><input type="checkbox" checked readOnly /> SQL Intro (28) - done</li>
            <li><input type="checkbox" readOnly /> REST APIs - done (docs/api/rest)</li>
            <li><input type="checkbox" readOnly /> Top 20% - 51 topics</li>
            <li><input type="checkbox" readOnly /> Full 257 - senior</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
