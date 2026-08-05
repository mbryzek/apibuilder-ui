import { describe, expect, it, vi } from 'vitest';
import { findScopedById, outOfScope } from './scoped-id';
import type { ApiResponse } from '$lib/api/error-handler';

interface Row {
  id: string;
}

const ok = (ids: string[]): ApiResponse<Row[]> => ({ status: 200, data: ids.map((id) => ({ id })) });
const err = (status: number): ApiResponse<Row[]> => ({ status, errors: [{ message: 'nope' }] });

/** A listing of `total` rows, served in pages, that records the (limit, offset) it was asked for. */
function listing(total: number) {
  const calls: Array<{ limit: number; offset: number }> = [];
  const fetchPage = async (limit: number, offset: number): Promise<ApiResponse<Row[]>> => {
    calls.push({ limit, offset });
    return ok(Array.from({ length: Math.max(0, Math.min(limit, total - offset)) }, (_, i) => `row-${offset + i}`));
  };
  return { calls, fetchPage };
}

/** The `HttpError` SvelteKit's `error()` throws. */
async function caught(fn: () => Promise<unknown>): Promise<{ status: number; body: { message: string } }> {
  try {
    await fn();
  } catch (thrown) {
    return thrown as { status: number; body: { message: string } };
  }
  throw new Error('expected the call to throw');
}

describe('findScopedById', () => {
  it('returns the row when the id is in the scoped listing', async () => {
    const found = await findScopedById('row-3', listing(10).fetchPage);
    expect(found).toEqual({ id: 'row-3' });
  });

  it('refuses an id that is absent from the scope', async () => {
    // The confused deputy: `guid` names a real row, but not one of THIS org's. The listing is
    // already scoped by the caller, so an id outside it simply is not there.
    expect(await findScopedById('victim-org-request', listing(10).fetchPage)).toBeNull();
  });

  it('stops at the first short page instead of paging to the bound', async () => {
    const { calls, fetchPage } = listing(10);
    expect(await findScopedById('absent', fetchPage)).toBeNull();
    expect(calls).toEqual([{ limit: 100, offset: 0 }]);
  });

  it('pages past the first page, so a legitimate id beyond it is still found', async () => {
    // Regression guard for the tokens page in particular: it paginates at 25 a page, so a user
    // with more tokens than one page must still be able to delete the ones further down.
    const { calls, fetchPage } = listing(250);
    expect(await findScopedById('row-201', fetchPage)).toEqual({ id: 'row-201' });
    expect(calls).toEqual([
      { limit: 100, offset: 0 },
      { limit: 100, offset: 100 },
      { limit: 100, offset: 200 }
    ]);
  });

  it('bounds the scan rather than following an endless listing', async () => {
    // A listing that never reports a short page must not spin forever.
    const fetchPage = vi.fn(async (limit: number) => ok(Array.from({ length: limit }, (_, i) => `filler-${i}`)));
    expect(await findScopedById('absent', fetchPage)).toBeNull();
    expect(fetchPage).toHaveBeenCalledTimes(25);
  });

  it('treats a definitive refusal as an empty scope', async () => {
    for (const status of [401, 403, 404]) {
      expect(await findScopedById('anything', async () => err(status))).toBeNull();
    }
  });

  it('abandons the request when the API never answered, rather than reporting "not found"', async () => {
    // Same reasoning as `requireAdminForAction`: an outage is not a denial. Answering 404 here
    // would tell an admin their own org's membership had vanished.
    for (const status of [0, 429, 500, 503]) {
      const thrown = await caught(() => findScopedById('anything', async () => err(status)));
      expect(thrown.status).toBeGreaterThanOrEqual(429);
    }
  });
});

describe('outOfScope', () => {
  it('refuses with 404 so a probe cannot confirm the id exists elsewhere', () => {
    expect(outOfScope()).toMatchObject({ status: 404, data: { errors: [{ message: 'Not found' }] } });
  });
});
