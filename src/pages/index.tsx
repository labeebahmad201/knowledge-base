import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

const categories = [
  {name: 'Computer Science', path: '/docs/category/computer-science', desc: 'Algorithms, data structures, OS, networking, databases, design patterns'},
  {name: 'Software Engineering', path: '/docs/category/software-engineering', desc: 'Languages, tools, architecture, testing, DevOps, observability'},
  {name: 'Artificial Intelligence', path: '/docs/category/artificial-intelligence', desc: 'ML, LLMs, prompt engineering, RAG, AI engineering'},
  {name: 'Labs', path: '/docs/category/labs', desc: 'Hands-on walkthroughs — Postgres, bash, Docker, cloud'},
  {name: 'Product', path: '/docs/category/product', desc: 'Product thinking, marketing, and building for users'},
];

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <header style={{textAlign: 'center', padding: '4rem 0 2rem', background: 'var(--ifm-color-primary)', color: '#fff'}}>
        <h1 style={{fontSize: '2.5rem', margin: 0}}>{siteConfig.title}</h1>
        <p style={{fontSize: '1.2rem', marginTop: '0.5rem', opacity: 0.9}}>{siteConfig.tagline}</p>
      </header>
      <main>
        <div style={{maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem'}}>
            {categories.map((cat) => (
              <div key={cat.name} style={{border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', padding: '1.5rem'}}>
                <h3><Link to={cat.path}>{cat.name}</Link></h3>
                <p style={{margin: 0, color: 'var(--ifm-color-emphasis-700)'}}>{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}
