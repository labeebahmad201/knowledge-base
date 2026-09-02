import {useCallback, useMemo} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';

function Flow() {
  const {siteConfig} = useDocusaurusContext();
  const base = siteConfig.baseUrl.replace(/\/$/, '');

  const {ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState} = require('@xyflow/react');
  const ConceptNode = require('../components/ConceptNode').default;
  require('@xyflow/react/dist/style.css');

  const nodeTypes = useMemo(() => ({concept: ConceptNode}), []);

  const nodePaths = useMemo(() => ({
    overview: `${base}/docs/computer-science/overview`,
    fundamentals: `${base}/docs/computer-science/fundamentals`,
    databases: `${base}/docs/computer-science/databases`,
    'db-comparison': `${base}/docs/computer-science/database-comparison`,
    'pg-mvcc': `${base}/docs/computer-science/postgresql-mvcc`,
    'pg-locks': `${base}/docs/computer-science/postgresql-locks`,
    'ddl-dml': `${base}/docs/computer-science/ddl-vs-dml`,
    'lc-two-pointers': `${base}/docs/computer-science/leetcode/lc-1-two-sum`,
    'lc-sliding-window': `${base}/docs/computer-science/leetcode/lc-3-longest-substring-without-repeating-characters`,
    'lc-hashmap': `${base}/docs/computer-science/leetcode/lc-242-valid-anagram`,
    'lc-greedy': `${base}/docs/computer-science/leetcode/lc-greedy`,
    'lc-arrays': `${base}/docs/computer-science/leetcode/lc-238-product-of-array-except-self`,
    'lc-design': `${base}/docs/computer-science/leetcode/lc-271-encode-and-decode-strings`,
  }), [base]);

  const onNodeClick = useCallback((_: any, node: any) => {
    const path = nodePaths[node.id];
    if (path) {
      window.location.href = path;
    }
  }, [nodePaths]);

  const initialNodes = useMemo(() => [
    {
      id: 'overview',
      type: 'concept',
      position: {x: 0, y: 200},
      data: {
        label: 'Overview',
        concepts: ['Section Index', 'Computer Science'],
        color: '#6b7280',
      },
    },
    {
      id: 'fundamentals',
      type: 'concept',
      position: {x: 280, y: 50},
      data: {
        label: 'Fundamentals',
        concepts: ['Big-O', 'Data Structures', 'Algorithms', 'Concurrency', 'Memory', 'OS', 'Networking'],
        color: '#10b981',
      },
    },
    {
      id: 'databases',
      type: 'concept',
      position: {x: 280, y: 320},
      data: {
        label: 'Databases',
        concepts: ['SQL', 'Indexes', 'Transactions', 'Replication', 'Sharding'],
        color: '#6366f1',
      },
    },
    {
      id: 'db-comparison',
      type: 'concept',
      position: {x: 600, y: 50},
      data: {
        label: 'DB Comparison',
        concepts: ['CAP Theorem', 'PACELC', 'Consistency Models'],
        color: '#8b5cf6',
      },
    },
    {
      id: 'pg-mvcc',
      type: 'concept',
      position: {x: 600, y: 240},
      data: {
        label: 'PostgreSQL MVCC',
        concepts: ['Snapshots', 'xmin/xmax', 'WAL', 'VACUUM', 'Isolation Levels'],
        color: '#f59e0b',
      },
    },
    {
      id: 'pg-locks',
      type: 'concept',
      position: {x: 600, y: 430},
      data: {
        label: 'PostgreSQL Locks',
        concepts: ['Shared/Exclusive', 'Row/Table Locks', 'Deadlocks', 'Advisory'],
        color: '#ef4444',
      },
    },
    {
      id: 'ddl-dml',
      type: 'concept',
      position: {x: 880, y: 320},
      data: {
        label: 'DDL vs DML',
        concepts: ['CREATE/ALTER/DROP', 'SELECT/INSERT/UPDATE/DELETE', 'Schema vs Data', 'Locking'],
        color: '#ec4899',
      },
    },
    {
      id: 'lc-two-pointers',
      type: 'concept',
      position: {x: 0, y: 430},
      data: {
        label: 'Two Pointers',
        concepts: ['Two Sum', '3Sum', 'Container Water', 'Palindrome', 'Rain Water'],
        color: '#06b6d4',
      },
    },
    {
      id: 'lc-sliding-window',
      type: 'concept',
      position: {x: 0, y: 590},
      data: {
        label: 'Sliding Window',
        concepts: ['Longest Substring', 'Repeating Replacement', 'Max Frequency'],
        color: '#06b6d4',
      },
    },
    {
      id: 'lc-hashmap',
      type: 'concept',
      position: {x: 280, y: 590},
      data: {
        label: 'Hash Map & Sets',
        concepts: ['Valid Anagram', 'Consecutive Sequence', 'Valid Sudoku'],
        color: '#06b6d4',
      },
    },
    {
      id: 'lc-greedy',
      type: 'concept',
      position: {x: 560, y: 590},
      data: {
        label: 'Greedy',
        concepts: ['Buy Sell Stock', 'Greedy Algorithms'],
        color: '#06b6d4',
      },
    },
    {
      id: 'lc-arrays',
      type: 'concept',
      position: {x: 0, y: 750},
      data: {
        label: 'Arrays & Prefix',
        concepts: ['Product Except Self', 'Top K Frequent'],
        color: '#06b6d4',
      },
    },
    {
      id: 'lc-design',
      type: 'concept',
      position: {x: 280, y: 750},
      data: {
        label: 'Design & Strings',
        concepts: ['Encode Decode Strings'],
        color: '#06b6d4',
      },
    },
  ], []);

  const initialEdges = useMemo(() => [
    {id: 'overview-fundamentals', source: 'overview', target: 'fundamentals', animated: true},
    {id: 'overview-databases', source: 'overview', target: 'databases', animated: true},
    {id: 'fundamentals-dbcomp', source: 'fundamentals', target: 'db-comparison'},
    {id: 'databases-dbcomp', source: 'databases', target: 'db-comparison'},
    {id: 'databases-pgmvcc', source: 'databases', target: 'pg-mvcc'},
    {id: 'databases-pglocks', source: 'databases', target: 'pg-locks'},
    {id: 'databases-ddldml', source: 'databases', target: 'ddl-dml'},
    {id: 'pgmvcc-pglocks', source: 'pg-mvcc', target: 'pg-locks'},
    {id: 'pglocks-ddldml', source: 'pg-locks', target: 'ddl-dml'},
    {id: 'dbcomp-pgmvcc', source: 'db-comparison', target: 'pg-mvcc', style: {strokeDasharray: '5 5'}},
    {id: 'fundamentals-lc-tp', source: 'fundamentals', target: 'lc-two-pointers'},
    {id: 'fundamentals-lc-sw', source: 'fundamentals', target: 'lc-sliding-window'},
    {id: 'fundamentals-lc-hm', source: 'fundamentals', target: 'lc-hashmap'},
    {id: 'fundamentals-lc-gr', source: 'fundamentals', target: 'lc-greedy'},
    {id: 'fundamentals-lc-ar', source: 'fundamentals', target: 'lc-arrays'},
    {id: 'fundamentals-lc-ds', source: 'fundamentals', target: 'lc-design'},
    {id: 'lc-tp-sw', source: 'lc-two-pointers', target: 'lc-sliding-window', style: {strokeDasharray: '5 5'}},
    {id: 'lc-sw-hm', source: 'lc-sliding-window', target: 'lc-hashmap', style: {strokeDasharray: '5 5'}},
    {id: 'lc-tp-gr', source: 'lc-two-pointers', target: 'lc-greedy', style: {strokeDasharray: '5 5'}},
    {id: 'lc-hm-ar', source: 'lc-hashmap', target: 'lc-arrays', style: {strokeDasharray: '5 5'}},
    {id: 'lc-gr-ar', source: 'lc-greedy', target: 'lc-arrays', style: {strokeDasharray: '5 5'}},
    {id: 'lc-ds-ar', source: 'lc-design', target: 'lc-arrays', style: {strokeDasharray: '5 5'}},
  ], []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const defaultViewport = useMemo(() => ({x: 0, y: 0, zoom: 0.85}), []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      defaultViewport={defaultViewport}
      fitView
      fitViewOptions={{padding: 0.2}}
      minZoom={0.3}
      maxZoom={2}
      proOptions={{hideAttribution: true}}
    >
      <Background gap={20} size={1} />
      <Controls showInteractive={false} />
      <MiniMap
        nodeStrokeWidth={3}
        zoomable
        pannable
      />
    </ReactFlow>
  );
}

export default function Concepts(): ReactNode {
  return (
    <Layout title="Concepts" description="Interactive concept map of computer science topics">
      <div className="concepts-page">
        <div className="concepts-header">
          <h1>Concept Map</h1>
          <p>Click any node to navigate to the article. Drag to pan, scroll to zoom.</p>
        </div>
        <div className="concepts-flow-container">
          <BrowserOnly fallback={<div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ifm-color-emphasis-600)'}}>Loading concept map...</div>}>
            {() => <Flow />}
          </BrowserOnly>
        </div>
      </div>
    </Layout>
  );
}
