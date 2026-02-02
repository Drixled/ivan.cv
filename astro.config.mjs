// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
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

  integrations: [mdx(), preact()],
});