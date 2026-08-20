/**
 * No page blocks its own submission, and no page judges an email address.
 *
 * CLAUDE.md: "No client-side input constraints — no maxlength, pattern attributes, or JS validation
 * that blocks submission. Let the server reject bad input and return clear errors." A `required`
 * attribute is exactly that — the browser refuses to POST and shows an unstyled native bubble in
 * place of the server's message, which is the one the app can style, translate and log. `type="email"`
 * goes further and refuses addresses the platform accepts.
 *
 * Asserted over the source because the rule is about markup a page can add at any time: a new field
 * copied from an older one is where this comes back, and the field component alone cannot see it.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const routes = fileURLToPath(new URL('./', import.meta.url));

function svelteFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = `${dir}${entry.name}`;
    if (entry.isDirectory()) return svelteFiles(`${path}/`);
    return entry.name.endsWith('.svelte') ? [path] : [];
  });
}

const pages = svelteFiles(routes).map((path) => ({
  name: path.slice(routes.length),
  source: readFileSync(path, 'utf8')
}));

/** Every `<input>`, `<select>` and `<textarea>` tag the pages declare, as source text. */
const controls = pages.flatMap(({ name, source }) =>
  [...source.matchAll(/<(input|select|textarea)\b[^>]*>/g)].map((match) => ({ name, tag: match[0] }))
);

function offenders(pattern: RegExp): string[] {
  return [...new Set(controls.filter(({ tag }) => pattern.test(tag)).map(({ name }) => name))];
}

describe('form inputs', () => {
  it('reads every page and finds its controls, so an empty result means checked rather than skipped', () => {
    expect(pages.length).toBeGreaterThan(20);
    expect(controls.length).toBeGreaterThan(10);
  });

  it('leaves the required check to the server', () => {
    expect(offenders(/(?<![\w-])required(?![\w-])/)).toEqual([]);
  });

  it('never asks the browser to validate an email address', () => {
    expect(offenders(/type="email"/)).toEqual([]);
  });

  it('has no other client-side constraint that refuses a submission', () => {
    expect(offenders(/(?<![\w-])(minlength|maxlength|pattern)=/)).toEqual([]);
  });
});
