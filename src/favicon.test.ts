/**
 * The site's icon: `static/favicon.ico` answers the browsers and crawlers that ask for that path
 * without reading any HTML, and `src/app.html` links it and the SVG so every page names both.
 * A link to a file `static/` does not hold is a 404 on every page load, so the links are read out
 * of app.html and each one is checked against the directory that is served.
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = new URL('../', import.meta.url);
const resolve = (name: string) => fileURLToPath(new URL(name, root));

const iconHrefs = [...readFileSync(resolve('src/app.html'), 'utf8').matchAll(/<link rel="icon" href="\/([^"]+)"/g)].map((m) => m[1]!);

describe('favicon', () => {
  it('app.html links the .ico and the .svg', () => {
    expect(iconHrefs).toEqual(['favicon.ico', 'favicon.svg']);
  });

  it.each(iconHrefs)('static/ serves %s', (href) => {
    expect(existsSync(resolve(`static/${href}`))).toBe(true);
  });

  it('favicon.ico is an ICO container', () => {
    const header = readFileSync(resolve('static/favicon.ico')).subarray(0, 4);
    expect([...header]).toEqual([0, 0, 1, 0]);
  });
});
