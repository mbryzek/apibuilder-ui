/**
 * `npm ci` followed by `npm run test:unit` works in a fresh clone (ISS-36692).
 *
 * `tsconfig.json` extends `$app/tsconfig`, which `svelte-kit sync` generates under `node_modules`.
 * `.npmrc` sets `ignore-scripts=true`, so `npm ci` never runs `prepare`, and vitest refuses to start
 * with `Tsconfig not found` until something syncs. CI cannot catch losing the sync: `ci/build.sh`
 * reaches vitest through `npm run check`, which has already synced.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const read = (name: string) => readFileSync(fileURLToPath(new URL(`../${name}`, import.meta.url)), 'utf8');
const scripts: Record<string, string> = JSON.parse(read('package.json')).scripts;

describe('the unit test scripts in a fresh clone', () => {
  it.each(['test:unit', 'test:unit:watch'])('%s syncs before vitest starts', (name) => {
    expect(scripts[name]).toMatch(/^svelte-kit sync && /);
  });
});
