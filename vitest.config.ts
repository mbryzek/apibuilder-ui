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
    include: ['src/**/*.test.ts'],
    environment: 'node'
  }
});
