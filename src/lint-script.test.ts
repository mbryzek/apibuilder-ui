/**
 * `npm ci` followed by `npm run lint` works in a fresh clone (ISS-36982).
 *
 * `eslint.config.js` type-checks `src` through `tsconfig.json`, which extends `$app/tsconfig`, and
 * only `svelte-kit sync` generates that file. `.npmrc` sets `ignore-scripts=true`, so `npm ci` never
 * runs `prepare`, and eslint fails until something syncs: TS6053 on one file, out of heap over the
 * whole tree. CI cannot catch losing the sync: `ci/build.sh` reaches eslint through `npm run check`,
 * which has already synced.
 *
 * `eslint --fix` turns off typescript-eslint's single-run inference, so it shares one watch program
 * per tsconfig among the config's blocks. A block with no `extraFileExtensions` that reaches a
 * tsconfig first builds that program without `.svelte`, and every `.svelte` file then fails to parse.
 * `npm run lint` runs without `--fix`, so nothing else in CI sees it.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const read = (name: string) => readFileSync(fileURLToPath(new URL(`../${name}`, import.meta.url)), 'utf8');
const scripts: Record<string, string> = JSON.parse(read('package.json')).scripts;

describe('the lint scripts in a fresh clone', () => {
  it.each(['lint', 'lint:fix'])('%s syncs before eslint starts', (name) => {
    expect(scripts[name]).toMatch(/^svelte-kit sync && eslint /);
  });
});

describe('the eslint config under --fix', () => {
  it('declares .svelte on every block that names a tsconfig', () => {
    // Read as text: importing it from a test pulls the config into svelte-check's program.
    const projects = read('eslint.config.js').match(/project: '[^']+',?(\s+extraFileExtensions: \[[^\]]*\])?/g) ?? [];

    expect(projects.length).toBeGreaterThan(0);
    for (const project of projects) {
      expect(project).toContain("extraFileExtensions: ['.svelte']");
    }
  });
});
