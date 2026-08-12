import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Unit tests run against plain modules — no SvelteKit dev server, so the aliases
// svelte.config.js declares are restated here.
export default defineConfig({
  resolve: {
    alias: {
      $lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
      $generated: fileURLToPath(new URL('./src/generated', import.meta.url))
    }
  },
  test: {
    // playwright/ is in here for its helpers only: the e2e specs themselves need two running
    // servers and never run unattended, but the helpers that talk to the platform API are plain
    // modules, and this is the only place their behavior gets executed.
    include: ['src/**/*.test.ts', 'playwright/**/*.test.ts'],
    environment: 'node'
  }
});
