// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import svelte from '@astrojs/svelte';
import compressor from 'astro-compressor';
import { svelteCSSPreprocess, svelteCSSFinalizer } from './src/plugins';
import svelteCustomCodePlugin from './src/plugins/svelte-custom-code'

const isDev = process.env.NODE_ENV === 'development';

// https://astro.build/config
export default defineConfig({
  integrations: isDev
    ? [svelte(), compressor()]
    : [
      svelte({
        // @ts-expect-error type error
        preprocess: [svelteCSSPreprocess],
      }),
      svelteCSSFinalizer(),
      compressor(),
    ],

  vite: isDev
    ? {}
    : {
      build: {
        assetsInlineLimit: 1024 * 10,
        cssCodeSplit: true,
        rollupOptions: {
          output: {
            assetFileNames: 'assets/[name]-[hash][extname]',
          },
        },
      },
      css: {
        // @ts-expect-error type error
        extract: true,
      },
      ssr: {
        noExternal: ['svelte'],
      },
      plugins: [
        svelteCustomCodePlugin(`
          import { componentTracker } from '../utils';
          if (import.meta.env.SSR) {
            console.log('[SSR] Tracking', componentName);
            componentTracker.add(componentName);
          }
          `),
        {
          name: 'exclude-svelte-css',
          transform(code, id) {
            // Prevent Vite from processing Svelte CSS files, as they are handled separately during SSR
            if (id.includes('svelte') && id.endsWith('.css')) {
              console.log(`[exclude-svelte-css] Skipping Svelte CSS: ${id}`);
              return ''; // Return empty to exclude from bundle
            }
          },
        },
      ],
    },
  output: 'server',

  adapter: node({
    mode: 'middleware',
  }),
});
