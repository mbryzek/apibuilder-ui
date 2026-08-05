/**
 * Single source of truth for list pagination.
 *
 * The page size lives here rather than in each loader because the `<Pagination>` component needs
 * the same number to compute its Previous/Next offsets. When the two are declared independently
 * they can drift, and a drifted stride does not error — it silently skips or repeats rows.
 */
export const PAGE_LIMIT = 25;

/**
 * The API's hard ceiling on `limit`, from the platform's own validation message:
 *
 *     GET /apibuilder/generators?limit=200
 *     [{"discriminator":"validation","message":"Invalid limit '200' - Must be > 0 and <= 101"}]
 *
 * Recorded here so the over-fetch below is visibly within budget, and so a future page size is
 * chosen against a known ceiling rather than discovered by a 409 in production.
 */
export const MAX_API_LIMIT = 101;

/**
 * The `limit` a loader sends: one row more than it renders.
 *
 * Whether a next page exists cannot be inferred from a full page — `rows.length === PAGE_LIMIT` is
 * equally consistent with "there are more" and "that was exactly the last one", and these list
 * endpoints return no total count. Asking for one extra row makes the difference observable: if it
 * comes back, there is at least one more row than we are showing.
 */
export const PAGE_FETCH_LIMIT = PAGE_LIMIT + 1;

/** What a list loader returns so `<Pagination>` can render Previous/Next. */
export interface Page<T> {
  rows: T[];
  offset: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Build a list page's URL from its path and whatever filters are currently applied.
 *
 * Two rules, both of which this codebase has been bitten by:
 *
 *  - the result carries the named filters and nothing else. Any query string already on `path` is
 *    discarded, so `offset` in particular cannot survive: narrowing a filter can only shrink the
 *    result set, and reusing the current offset across a filter change lands past the end of the
 *    new set — an empty page that reads as "no matches". Every filter change restarts at page one.
 *  - a blank value is dropped rather than sent as `?q=`, so the canonical URL of an unfiltered
 *    list is the bare path.
 *
 * This is also exactly what `<Pagination baseUrl>` wants: it sets `offset` on top of what it is
 * given, so the active filter rides along on Previous/Next instead of being lost on the first
 * page turn.
 */
export function listUrl(path: string, filters: Record<string, string | undefined> = {}): string {
  const url = new URL(path, 'http://localhost');
  url.search = '';
  for (const [name, value] of Object.entries(filters)) {
    const trimmed = value?.trim();
    if (trimmed) {
      url.searchParams.set(name, trimmed);
    }
  }
  return url.pathname + url.search;
}

/**
 * Read the `offset` query param as a non-negative, safely representable integer.
 *
 * `Number(url.searchParams.get('offset') || '0')` yields `NaN` for anything non-numeric, which then
 * goes out on the wire as `offset=NaN`; the API rejects it and the page renders an empty list as
 * though there were simply no data. Negative and fractional values are equally meaningless.
 *
 * The upper bound matters for the same reason as the lower one: the generated client serializes the
 * offset with `String()`, and `String(1e21)` is the exponential literal `1e+21`, which the API
 * rejects — an empty list again, presented as success. Anything past `Number.MAX_SAFE_INTEGER` is
 * no longer the integer the user typed, so it cannot be paginated from either.
 */
export function parseOffset(url: URL): number {
  const parsed = Math.floor(Number(url.searchParams.get('offset')));
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    return 0;
  }
  return parsed;
}

/**
 * Split an over-fetched result into the rows to render and whether a next page exists.
 *
 * `rows` must come from a call that sent `PAGE_FETCH_LIMIT`; the extra row is evidence, not
 * content, so it is dropped here rather than rendered. Stating the rule once is the point — it
 * previously sat inline in six loaders as `rows.length >= PAGE_LIMIT`, which offers a Next link on
 * any list whose length is an exact multiple of the page size, leading to an empty page.
 */
export function toPage<T>(rows: T[], offset: number): Page<T> {
  return {
    rows: rows.slice(0, PAGE_LIMIT),
    offset,
    limit: PAGE_LIMIT,
    hasMore: rows.length > PAGE_LIMIT
  };
}
