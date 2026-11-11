import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

// Unit tests run against plain modules — no SvelteKit dev server. `#lib/*` and `#generated/*`
// are package.json subpath imports, which Vite resolves on its own.
export default defineConfig({
  // Components are compiled by the svelte plugin alone, without the sveltekit() one: a test mounts
  // a component directly, so there is no router and no server to build. `$app/forms` has no
  // meaning outside a running app, so it is aliased to a double that records what each component
  // hands `enhance` — see src/lib/test-support/app-forms.ts. `$app/navigation` likewise, to inert
  // stand-ins, so a spec can mount a whole page — see src/lib/test-support/app-navigation.ts.
  // `$app/state` to a `page` a spec sets — see src/lib/test-support/app-state.svelte.ts.
  // `$app/env`, `$app/server` and `cloudflare:workers` likewise, for the API-failure telemetry in
  // `#lib/api/error-handler.ts` and `hooks.server.ts`, and `$app/env/private` for the screen
  // report's token and `$app/env/public` for the release it stamps. Both are listed before `$app/env`,
  // which would otherwise claim them as a prefix.
  plugins: [svelte({ configFile: false })],
  // Nothing here is pre-bundled. Vite's dependency optimizer reads tsconfig.json, which extends
  // `$app/tsconfig`, a path only the sveltekit() plugin resolves; installing `jsdom` is what wakes
  // the optimizer, and without this every suite fails to start on "Tsconfig not found".
  optimizeDeps: { noDiscovery: true, include: [] },
  resolve: {
    alias: {
      '$app/forms': fileURLToPath(new URL('./src/lib/test-support/app-forms.ts', import.meta.url)),
      '$app/navigation': fileURLToPath(new URL('./src/lib/test-support/app-navigation.ts', import.meta.url)),
      '$app/state': fileURLToPath(new URL('./src/lib/test-support/app-state.svelte.ts', import.meta.url)),
      '$app/env/private': fileURLToPath(new URL('./src/lib/test-support/app-env-private.ts', import.meta.url)),
      '$app/env/public': fileURLToPath(new URL('./src/lib/test-support/app-env-public.ts', import.meta.url)),
      '$app/env': fileURLToPath(new URL('./src/lib/test-support/app-env.ts', import.meta.url)),
      '$app/server': fileURLToPath(new URL('./src/lib/test-support/app-server.ts', import.meta.url)),
      'cloudflare:workers': fileURLToPath(new URL('./src/lib/test-support/cloudflare-workers.ts', import.meta.url))
    },
    // Svelte ships a server build and a client build; mounting needs the client one.
    conditions: ['browser']
  },
  test: {
    // playwright/ is in here for its helpers only: the e2e specs themselves need two running
    // servers and never run unattended, but the helpers that talk to the platform API are plain
    // modules, and this is the only place their behavior gets executed.
    include: ['src/**/*.test.ts', 'playwright/**/*.test.ts'],
    // Component tests opt into a DOM per file with a `@vitest-environment happy-dom` docblock;
    // every other suite here is plain modules and does not need one. The screen report's browser
    // test is a member copy of admin-ui's and names `jsdom`, so that environment is installed too.
    environment: 'node'
  }
});
