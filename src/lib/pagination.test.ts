import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parameterBounds as apibuilderBounds } from '$generated/com-bryzek-apibuilder';
import { parameterBounds as generatorBounds } from '$generated/com-bryzek-apibuilder-generator';
import { parameterBounds as platformBounds } from '$generated/com-bryzek-platform';
import { PAGE_FETCH_LIMIT, PAGE_LIMIT, listUrl, parseOffset, toPage } from './pagination';

function offsetOf(query: string): number {
  return parseOffset(new URL(`http://localhost/history${query}`));
}

/** `n` rows, distinguishable so a slice can be checked for which end it kept. */
function rows(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

describe('parseOffset', () => {
  it('reads a well-formed offset', () => {
    expect(offsetOf('?offset=50')).toBe(50);
  });

  it('defaults to the first page when the param is absent or empty', () => {
    expect(offsetOf('')).toBe(0);
    expect(offsetOf('?offset=')).toBe(0);
  });

  it('clamps the values that would go out on the wire as a rejected query', () => {
    // Each of these previously reached the API and came back as an empty list, which the
    // page then rendered as "there is nothing here".
    expect(offsetOf('?offset=abc')).toBe(0); // NaN
    expect(offsetOf('?offset=-50')).toBe(0);
    expect(offsetOf('?offset=Infinity')).toBe(0);
    expect(offsetOf('?offset=1e21')).toBe(0); // String(1e21) is '1e+21'
    expect(offsetOf('?offset=99999999999999999999')).toBe(0); // past MAX_SAFE_INTEGER
  });

  it('truncates a fractional offset rather than sending it', () => {
    expect(offsetOf('?offset=1.5')).toBe(1);
  });

  it('accepts the largest offset that still round-trips as an integer', () => {
    expect(offsetOf(`?offset=${Number.MAX_SAFE_INTEGER}`)).toBe(Number.MAX_SAFE_INTEGER);
  });
});

// The ceiling on `limit` is the spec's, and the generated client emits it per operation as
// `parameterBounds`. Each loader's own operation is checked rather than one standing in for the
// rest: the ceilings are not obliged to be the same number, and sending a limit above one is a 422
// that renders as an empty list. Keyed by generated method name so the second test can check the
// list covers every call site.
const CEILINGS: Record<string, { readonly maximum: number }> = {
  getApplications: apibuilderBounds.getApplications.limit,
  getChanges: apibuilderBounds.getChanges.limit,
  getItems: apibuilderBounds.getItems.limit,
  getMemberships: apibuilderBounds.getMemberships.limit,
  getMembershipRequests: apibuilderBounds.getMembershipRequests.limit,
  getGenerators: generatorBounds.getGenerators.limit,
  getTokensUsersByUserId: platformBounds.getTokensUsersByUserId.limit
};

/** Every generated method a loader that sends `PAGE_FETCH_LIMIT` calls, read off the sources. */
function operationsSentTheFetchLimit(): string[] {
  const routes = fileURLToPath(new URL('../routes/', import.meta.url));
  const found = new Set<string>();
  for (const file of readdirSync(routes, { recursive: true, encoding: 'utf8' })) {
    if (!file.endsWith('+page.server.ts')) {
      continue;
    }
    const source = readFileSync(join(routes, file), 'utf8');
    // The client method a `limit: PAGE_FETCH_LIMIT` belongs to is the last one called before it:
    // the argument object is that call's, and a loader that sends the limit to two operations
    // (members does) has one such call per operation.
    for (const before of source.split(/\blimit: PAGE_FETCH_LIMIT\b/).slice(0, -1)) {
      const calls = [...before.matchAll(/\.(\w+)\(/g)];
      const method = calls.at(-1)?.[1];
      if (method) {
        found.add(method);
      }
    }
  }
  return [...found].sort();
}

describe('PAGE_FETCH_LIMIT', () => {
  it.each(Object.entries(CEILINGS))('is within the ceiling %s declares', (_method, limit) => {
    expect(PAGE_FETCH_LIMIT).toBeLessThanOrEqual(limit.maximum);
  });

  // Without this, a loader added against an operation with a lower ceiling is simply unchecked --
  // the assertions above would still pass, and the 422 would be found in production.
  it('is checked against every operation a loader sends it to', () => {
    expect(operationsSentTheFetchLimit()).toEqual(Object.keys(CEILINGS).sort());
  });
});

describe('toPage', () => {
  it('asks for one row more than it shows', () => {
    // The over-fetch is the whole mechanism: without it `hasMore` is a guess.
    expect(PAGE_FETCH_LIMIT).toBe(PAGE_LIMIT + 1);
  });

  it('reports no next page when the last page is exactly full', () => {
    // The case the old `rows.length >= PAGE_LIMIT` rule got wrong: a list whose length is an
    // exact multiple of the page size offered a Next link to an empty page.
    expect(toPage(rows(PAGE_LIMIT), 0)).toEqual({ rows: rows(PAGE_LIMIT), offset: 0, limit: PAGE_LIMIT, hasMore: false });
  });

  it('reports a next page only when the extra row came back', () => {
    expect(toPage(rows(PAGE_FETCH_LIMIT), 0).hasMore).toBe(true);
  });

  it('never renders the extra row', () => {
    const page = toPage(rows(PAGE_FETCH_LIMIT), 0);
    expect(page.rows).toHaveLength(PAGE_LIMIT);
    expect(page.rows).not.toContain(PAGE_LIMIT);
  });

  it('handles a partial and an empty page', () => {
    expect(toPage(rows(3), 0)).toEqual({ rows: [0, 1, 2], offset: 0, limit: PAGE_LIMIT, hasMore: false });
    expect(toPage([], 25)).toEqual({ rows: [], offset: 25, limit: PAGE_LIMIT, hasMore: false });
  });

  it('carries the offset through so Previous can be computed from it', () => {
    expect(toPage(rows(5), 75).offset).toBe(75);
  });
});

describe('listUrl', () => {
  it('is the bare path when nothing is filtered', () => {
    expect(listUrl('/generators')).toBe('/generators');
    expect(listUrl('/generators', { q: '' })).toBe('/generators');
    expect(listUrl('/generators', { q: undefined })).toBe('/generators');
    expect(listUrl('/generators', { q: '   ' })).toBe('/generators');
  });

  it('carries the filters it is given', () => {
    expect(listUrl('/generators', { q: 'scala' })).toBe('/generators?q=scala');
    expect(listUrl('/search', { q: 'play', org_key: 'bryzek' })).toBe('/search?q=play&org_key=bryzek');
  });

  it('encodes values that would otherwise change the URL structure', () => {
    expect(listUrl('/search', { q: 'a b&c=d#e' })).toBe('/search?q=a+b%26c%3Dd%23e');
  });

  it('trims, so a stray space does not produce a different URL for the same filter', () => {
    expect(listUrl('/generators', { q: '  scala  ' })).toBe('/generators?q=scala');
  });

  // The rule this function exists for. `<Pagination>` sets `offset` on top of the base URL, so a
  // base URL that carried the current one would send Previous/Next to a stale page — and, worse,
  // a filter typed while on page 3 would land past the end of the smaller filtered set and render
  // as "no matches".
  it('never carries an offset, even when the path already has one', () => {
    expect(listUrl('/generators?offset=50', { q: 'scala' })).toBe('/generators?q=scala');
    expect(listUrl('/generators?offset=50')).toBe('/generators');
  });
});
