/**
 * Single source of truth for list pagination.
 *
 * The page size lives here rather than in each loader because the `<Pagination>` component needs
 * the same number to compute its Previous/Next offsets. When the two are declared independently
 * they can drift, and a drifted stride does not error — it silently skips or repeats rows.
 */
export const PAGE_LIMIT = 25;

/**
 * Read the `offset` query param as a non-negative integer.
 *
 * `Number(url.searchParams.get('offset') || '0')` yields `NaN` for anything non-numeric, which then
 * goes out on the wire as `offset=NaN`; the API rejects it and the page renders an empty list as
 * though there were simply no data. Negative and fractional values are equally meaningless.
 */
export function parseOffset(url: URL): number {
  const parsed = Number(url.searchParams.get('offset'));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }
  return Math.floor(parsed);
}
