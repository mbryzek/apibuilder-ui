import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { csp } from './src/csp.ts';

export default defineConfig({
  // ui ships `submission.svelte.ts` as source, and Vite's dependency pre-bundler hands it to Svelte's
  // module compiler without stripping its TypeScript, so the dev server fails to start
  // (`js_parse_error`). Excluded, it is compiled by the app's own plugins like any other source file.
  // The build and vitest never pre-bundle and are unaffected.
  optimizeDeps: { exclude: ['ui'] },
  plugins: [
    tailwindcss(),
    sveltekit({
      preprocess: vitePreprocess(),
      adapter: adapter({ routes: { include: ['/*'], exclude: ['<all>'] } }),
      csp
    })
  ]
});
