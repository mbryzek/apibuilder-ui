import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

// Unit tests run against plain modules — no SvelteKit dev server, so the aliases
// svelte.config.js declares are restated here.
export default defineConfig({
  // Components are compiled by the svelte plugin alone, without the sveltekit() one: a test mounts
  // a component directly, so there is no router and no server to build. `$app/forms` has no
  // meaning outside a running app, so it is aliased to a double that records what each component
  // hands `enhance` — see src/lib/test-support/app-forms.ts.
  plugins: [svelte()],
  resolve: {
    alias: {
      $lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
      $generated: fileURLToPath(new URL('./src/generated', import.meta.url)),
      '$app/forms': fileURLToPath(new URL('./src/lib/test-support/app-forms.ts', import.meta.url))
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
    // every other suite here is plain modules and does not need one.
    environment: 'node'
  }
});
