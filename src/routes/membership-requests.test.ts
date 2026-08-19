import { beforeEach, describe, expect, it, vi } from 'vitest';
import { session } from '$lib/test-support/fixtures';
import { mockApiClients } from '$lib/test-support/mocks';
import { PAGE_FETCH_LIMIT, PAGE_LIMIT } from '$lib/pagination';

/**
 * Every pending request has to be reachable, because accepting one is only possible from here.
 *
 * The list is the whole surface: there is no other route that admits a member, so a row past the
 * page size is a person who cannot be admitted at all — and the members page links here with a
 * "25+" badge, so the app knows there are more even when this page cannot show them.
 */

const client = {
  getMemberships: vi.fn(),
  getMembershipRequests: vi.fn()
};

vi.mock('$lib/api/clients', async (importOriginal) => mockApiClients(client, importOriginal));

const { load } = await import('./[orgKey]/membership-requests/+page.server');

interface LoadedPage {
  requests: { id: string }[];
  offset: number;
  limit: number;
  hasMore: boolean;
}

function invokeLoad(url = 'http://localhost/acme/membership-requests') {
  const event = {
    params: { orgKey: 'acme' },
    locals: { session: session() },
    url: new URL(url),
    parent: async () => ({ isAdmin: true })
  };
  return (load as (e: typeof event) => Promise<LoadedPage>)(event);
}

/** `n` requests, as the API would return them. */
function requests(n: number) {
  return Array.from({ length: n }, (_, i) => ({ id: `req-${i}`, user: { nickname: `u${i}`, email: `u${i}@x` }, role: 'member' }));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('membership requests paginate', () => {
  it('over-fetches by one so the extra row is evidence rather than content', async () => {
    client.getMembershipRequests.mockResolvedValue(requests(PAGE_FETCH_LIMIT));

    const data = await invokeLoad();

    expect(client.getMembershipRequests).toHaveBeenCalledWith(expect.objectContaining({ limit: PAGE_FETCH_LIMIT, offset: 0 }));
    expect(data.requests).toHaveLength(PAGE_LIMIT);
    expect(data.hasMore).toBe(true);
  });

  it('reports no next page when the results fit', async () => {
    client.getMembershipRequests.mockResolvedValue(requests(PAGE_LIMIT));

    const data = await invokeLoad();

    expect(data.requests).toHaveLength(PAGE_LIMIT);
    expect(data.hasMore).toBe(false);
  });

  it('reaches the 26th request, which no offset could reach before', async () => {
    client.getMembershipRequests.mockResolvedValue(requests(3));

    const data = await invokeLoad('http://localhost/acme/membership-requests?offset=25');

    expect(client.getMembershipRequests).toHaveBeenCalledWith(expect.objectContaining({ offset: 25 }));
    expect(data.offset).toBe(25);
    expect(data.requests).toHaveLength(3);
  });

  it('ignores an offset that is not a usable integer rather than sending it upstream', async () => {
    client.getMembershipRequests.mockResolvedValue([]);

    const data = await invokeLoad('http://localhost/acme/membership-requests?offset=not-a-number');

    expect(client.getMembershipRequests).toHaveBeenCalledWith(expect.objectContaining({ offset: 0 }));
    expect(data.offset).toBe(0);
  });
});

describe('the page stays admin-only', () => {
  it('refuses a member who is not an admin', async () => {
    const event = {
      params: { orgKey: 'acme' },
      locals: { session: session() },
      url: new URL('http://localhost/acme/membership-requests'),
      parent: async () => ({ isAdmin: false })
    };

    await expect((load as (e: typeof event) => Promise<unknown>)(event)).rejects.toMatchObject({ status: 403 });
    expect(client.getMembershipRequests).not.toHaveBeenCalled();
  });
});
