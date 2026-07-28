import React from 'react';
import {useLocation} from '@docusaurus/router';
import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import Link from '@docusaurus/Link';

interface SidebarItem {
  type: string;
  label: string;
  href?: string;
  docId?: string;
  description?: string;
  items?: SidebarItem[];
  customProps?: Record<string, unknown>;
}

function flattenItems(items: SidebarItem[]): SidebarItem[] {
  const result: SidebarItem[] = [];
  for (const item of items) {
    if (item.type === 'link') {
      result.push(item);
    }
    if (item.type === 'category' && item.items) {
      result.push(...flattenItems(item.items));
    }
  }
  return result;
}

export default function DocCategoryList() {
  const {pathname} = useLocation();
  const sidebar = useDocsSidebar();
  const items: SidebarItem[] = (sidebar?.items ?? []) as SidebarItem[];

  const normalizedPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  const docHrefs = items.map((item) => {
    const links = flattenItems([item]);
    return {category: item, links};
  });

  let categoryItems: SidebarItem[] | null = null;

  for (const {category, links} of docHrefs) {
    if (category.href && normalizedPath.startsWith(category.href.replace(/\/$/, ''))) {
      if (category.items && category.items.length > 0) {
        categoryItems = category.items;
        break;
      }
    }
    for (const link of links) {
      if (link.href && normalizedPath === link.href.replace(/\/$/, '')) {
        categoryItems = category.items ?? null;
        break;
      }
    }
    if (categoryItems) break;
  }

  if (!categoryItems || categoryItems.length === 0) return null;

  const visibleItems = categoryItems.filter(
    (item) => item.type === 'link' && item.href !== normalizedPath
  );

  if (visibleItems.length === 0) return null;

  return (
    <ol style={{paddingLeft: '1.25rem', margin: '0 1.5rem'}}>
      {visibleItems.map((item, index) => (
        <li key={index} style={{marginBottom: '0.5rem'}}>
          <Link
            to={item.href ?? '#'}
            style={{fontWeight: 600, fontSize: '0.95rem'}}
          >
            {item.label}
          </Link>
          {item.description && (
            <p
              style={{
                margin: '0.15rem 0 0 0',
                color: 'var(--ifm-color-emphasis-600)',
                fontSize: '0.85rem',
              }}
            >
              {item.description}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
