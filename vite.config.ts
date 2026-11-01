import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import { configFrom } from './src/lib/config-values.ts';
import { csp } from './src/csp.ts';

export default defineConfig(({ command, mode }) => {
  // A build reads its configuration HERE, the way the bundle will: `configFrom` throws on a
  // production build missing a variable whose development default is localhost, so the build
  // fails instead of shipping a Worker that calls localhost from Cloudflare. ISS-37645
  if (command === 'build') configFrom({ ...loadEnv(mode, process.cwd(), 'VITE_'), PROD: true });
  return {
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
  };
});
