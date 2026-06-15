import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Knowledge Base',
  tagline: 'Computer Science, Engineering, AI & Product',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://labeebahmad201.github.io',
  baseUrl: '/knowledge-base/',

  organizationName: 'labeebahmad201',
  projectName: 'knowledge-base',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/labeebahmad201/knowledge-base/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Knowledge Base',
      logo: {
        alt: 'Knowledge Base',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/labeebahmad201/knowledge-base',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Computer Science',
              to: '/docs/category/computer-science',
            },
            {
              label: 'Software Engineering',
              to: '/docs/category/software-engineering',
            },
            {
              label: 'Artificial Intelligence',
              to: '/docs/category/artificial-intelligence',
            },
            {
              label: 'Labs',
              to: '/docs/category/labs',
            },
            {
              label: 'Product',
              to: '/docs/category/product',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/labeebahmad201/knowledge-base',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Knowledge Base. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,

  plugins: [
    require.resolve('@easyops-cn/docusaurus-search-local'),
  ],
};

export default config;
