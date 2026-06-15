import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

const categories = [
  {name: 'Computer Science', path: '/docs/category/computer-science', desc: 'Algorithms, data structures, OS, networking, databases, design patterns', icon: '💻'},
  {name: 'LeetCode', path: '/docs/computer-science/leetcode/', desc: 'LeetCode solutions with multiple approaches, complexity analysis, and tradeoffs', icon: '🏆'},
  {name: 'Software Engineering', path: '/docs/category/software-engineering', desc: 'Languages, tools, architecture, testing, DevOps, observability', icon: '🛠'},
  {name: 'Artificial Intelligence', path: '/docs/category/artificial-intelligence', desc: 'ML, LLMs, prompt engineering, RAG, AI engineering', icon: '🤖'},
  {name: 'Labs', path: '/docs/category/labs', desc: 'Hands-on walkthroughs — Postgres, bash, Docker, cloud', icon: '🧪'},
  {name: 'Product', path: '/docs/category/product', desc: 'Product thinking, marketing, and building for users', icon: '📦'},
];

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <header
        style={{
          textAlign: 'center',
          padding: '6rem 1rem 4rem',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            backgroundImage: 'radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px), radial-gradient(circle at 75% 75%, #fff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <h1 style={{fontSize: '3rem', margin: 0, fontWeight: 800, letterSpacing: '-0.03em', position: 'relative'}}>
          {siteConfig.title}
        </h1>
        <p style={{fontSize: '1.25rem', marginTop: '0.75rem', opacity: 0.9, fontWeight: 400, position: 'relative'}}>
          {siteConfig.tagline}
        </p>
      </header>
      <main>
        <div style={{maxWidth: '1000px', margin: '0 auto', padding: '3rem 1rem 4rem'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem'}}>
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                style={{textDecoration: 'none', color: 'inherit'}}
              >
                <div
                  className="card"
                  style={{
                    padding: '1.75rem',
                    borderRadius: '12px',
                    background: 'var(--ifm-card-background-color)',
                    border: '1px solid var(--ifm-color-emphasis-200)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    height: '100%',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ifm-color-primary)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ifm-color-emphasis-200)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{fontSize: '2rem', marginBottom: '0.75rem', lineHeight: 1}}>
                    {cat.icon}
                  </div>
                  <h3 style={{margin: '0 0 0.5rem', fontWeight: 700, fontSize: '1.15rem'}}>{cat.name}</h3>
                  <p style={{margin: 0, color: 'var(--ifm-color-emphasis-600)', fontSize: '0.9rem', lineHeight: 1.5}}>
                    {cat.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}
