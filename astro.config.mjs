// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://ivan.cv',
  output: 'static',

  image: {
    // Use sharp for image optimization (WebP, AVIF, responsive sizes)
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },

  prefetch: {
    defaultStrategy: 'hover',
    prefetchAll: false,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    mdx(),
    preact(),
    sitemap({
      filter: (page) =>
        !page.includes('/playground') &&
        !page.includes('/styleguide') &&
        !page.includes('/project/rever') &&
        !page.includes('/project/mediwallet'),
    }),
  ],
});