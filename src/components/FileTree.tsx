import React from 'react';

export interface FileNode {
  name: string;
  type?: 'file' | 'folder';
  note?: string;
  children?: FileNode[];
}

interface FileTreeProps {
  items: FileNode[];
  root?: string;
}

function FolderIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{flexShrink: 0}}
    >
      <path
        d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4l2 2h7A1.5 1.5 0 0 1 19 8.5v9A1.5 1.5 0 0 1 17.5 19h-13A1.5 1.5 0 0 1 3 17.5v-11Z"
        fill="var(--ifm-color-primary)"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{flexShrink: 0}}
    >
      <path
        d="M6 2h7l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z"
        fill="var(--ifm-color-emphasis-500)"
      />
      <path d="M13 2v5h5" stroke="var(--ifm-background-surface-color)" strokeWidth="1" />
    </svg>
  );
}

function TreeNode({node}: {node: FileNode}) {
  const isFolder = node.type === 'folder' || Array.isArray(node.children);

  return (
    <li style={{listStyle: 'none', margin: 0}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.15rem 0'}}>
        {isFolder ? <FolderIcon /> : <FileIcon />}
        <span
          style={{
            fontFamily: 'var(--ifm-font-family-monospace)',
            fontSize: 'var(--ifm-code-font-size)',
            fontWeight: isFolder ? 600 : 400,
          }}
        >
          {node.name}
        </span>
        {node.note && (
          <span
            style={{
              marginLeft: '0.35rem',
              fontSize: '0.72rem',
              fontStyle: 'italic',
              color: 'var(--ifm-color-emphasis-600)',
            }}
          >
            {node.note}
          </span>
        )}
      </div>
      {node.children && (
        <ul
          style={{
            margin: 0,
            padding: 0,
            paddingLeft: '1.1rem',
            marginLeft: '0.45rem',
            borderLeft: '1px dashed var(--ifm-color-emphasis-300)',
          }}
        >
          {node.children.map((child, index) => (
            <TreeNode key={index} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function FileTree({items, root}: FileTreeProps) {
  return (
    <div
      style={{
        border: '1px solid var(--ifm-color-emphasis-200)',
        borderRadius: '10px',
        padding: '0.9rem 1.1rem',
        margin: '1.25rem 0',
        background: 'var(--ifm-background-surface-color)',
        overflowX: 'auto',
      }}
    >
      {root && (
        <div
          style={{
            fontFamily: 'var(--ifm-font-family-monospace)',
            fontSize: 'var(--ifm-code-font-size)',
            fontWeight: 700,
            color: 'var(--ifm-color-primary)',
            marginBottom: '0.5rem',
          }}
        >
          {root}
        </div>
      )}
      <ul style={{margin: 0, padding: 0}}>
        {items.map((item, index) => (
          <TreeNode key={index} node={item} />
        ))}
      </ul>
    </div>
  );
}
