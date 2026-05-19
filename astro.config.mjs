import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeExternalLinks from 'rehype-external-links';

import cloudflare from "@astrojs/cloudflare";

// Update `site` before deploy so canonical URLs, OG, and sitemap resolve correctly.
export default defineConfig({
  site: 'https://shreyanshsharma.me',
  integrations: [sitemap()],
  trailingSlash: 'ignore',

  build: {
    format: 'directory',
  },

  devToolbar: {
    enabled: false,
  },

  markdown: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      [rehypeKatex, { strict: false }],
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['noopener', 'noreferrer'],
        },
      ],
    ],
  },

  adapter: cloudflare()
});