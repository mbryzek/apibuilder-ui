import { beforeEach, describe, expect, it, vi } from 'vitest';
import { session } from '#lib/test-support/fixtures.ts';
import { mockApiClients } from '#lib/test-support/mocks.ts';
import { caughtAsync } from '#lib/test-support/throws.ts';

/**
 * What a visitor outside an organization gets from its pages. The API decides what is readable, so
 * these pin the wiring around it: a signed-out load asks with no credential and asks nothing a
 * signed-out caller cannot be answered, and a refusal stays a 404 that confirms nothing.
 */

const client = {
  getOrganizationDetail: vi.fn(),
  getChanges: vi.fn(),
  getCode: vi.fn(),
  getItems: vi.fn()
};

vi.mock('#lib/api/clients.ts', async (importOriginal) => mockApiClients(client, importOriginal));

const { load: orgLayoutLoad } = await import('./[orgKey]/+layout.server');
const { load: historyLoad } = await import('./[orgKey]/[appKey]/[version]/history/+page.server');
const { load: generatorLoad } = await import('./[orgKey]/[appKey]/[version]/[generatorKey]/+page.server');
const { GET: generatorDownload } = await import('./[orgKey]/[appKey]/[version]/[generatorKey]/download/+server');
const { load: searchLoad } = await import('./search/+page.server');
const { load: siteHistoryLoad } = await import('./history/+page.server');

const ORG = { id: 'org-1', key: 'public-org', name: 'Public', namespace: 'io.public', visibility: 'public', domains: [] };

function loadOrg(locals: App.Locals) {
  return orgLayoutLoad({ params: { orgKey: 'public-org' }, locals } as unknown as Parameters<typeof orgLayoutLoad>[0]);
}

function loadHistory(
  locals: App.Locals,
  parent: () => Promise<unknown> = async () => ({ version: { version: '2026-01-01' } }),
  orgKey = 'public-org'
) {
  return historyLoad({
    params: { orgKey, appKey: 'app', version: 'latest' },
    locals,
    url: new URL('https://apibuilder.test/public-org/app/latest/history'),
    parent
  } as unknown as Parameters<typeof historyLoad>[0]);
}

function refusedWith(status: number) {
  return Object.assign(new Error('refused'), { status, response: { status } });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('the organization layout, signed out', () => {
  it('reads a public organization in one call, with no membership', async () => {
    client.getOrganizationDetail.mockResolvedValue({ organization: ORG, memberships: [] });

    const data = (await loadOrg({})) as { org: unknown; isMember: boolean; isAdmin: boolean; membershipLoadError: unknown };

    expect(data.org).toEqual(ORG);
    expect(data.isMember).toBe(false);
    expect(data.isAdmin).toBe(false);
    expect(data.membershipLoadError).toBeNull();
    expect(client.getOrganizationDetail).toHaveBeenCalledTimes(1);
    expect(client.getOrganizationDetail).toHaveBeenCalledWith('public-org');
  });

  it.each([401, 404])('is a 404 when the API answers %i, so a private organization cannot be confirmed', async (status) => {
    client.getOrganizationDetail.mockRejectedValue(refusedWith(status));

    const thrown = await caughtAsync(() => loadOrg({}));

    expect(thrown.status).toBe(404);
  });
});

describe('the organization layout, signed in', () => {
  it('reads a public organization as not a member when the viewer holds no membership', async () => {
    client.getOrganizationDetail.mockResolvedValue({ organization: ORG, memberships: [] });

    const data = (await loadOrg({ session: session() })) as { isMember: boolean; membershipLoadError: unknown };

    expect(data.isMember).toBe(false);
    expect(data.membershipLoadError).toBeNull();
  });

  it('reads a member, and an admin, from the memberships the detail carries', async () => {
    client.getOrganizationDetail.mockResolvedValue({
      organization: ORG,
      memberships: [
        { guid: 'm-1', role: 'member' },
        { guid: 'm-2', role: 'admin' }
      ]
    });

    const data = (await loadOrg({ session: session() })) as { isMember: boolean; isAdmin: boolean; membershipLoadError: unknown };

    expect(data.isMember).toBe(true);
    expect(data.isAdmin).toBe(true);
    expect(data.membershipLoadError).toBeNull();
  });

  it('reads a member who is not an admin', async () => {
    client.getOrganizationDetail.mockResolvedValue({ organization: ORG, memberships: [{ guid: 'm-1', role: 'member' }] });

    const data = (await loadOrg({ session: session() })) as { isMember: boolean; isAdmin: boolean };

    expect(data.isMember).toBe(true);
    expect(data.isAdmin).toBe(false);
  });

  it('reports a membership load error, never "not a member", when the memberships are absent', async () => {
    client.getOrganizationDetail.mockResolvedValue({ organization: ORG });

    const data = (await loadOrg({ session: session() })) as {
      org: unknown;
      isMember: boolean;
      isAdmin: boolean;
      membershipLoadError: { status: number; message: string } | null;
    };

    expect(data.org).toEqual(ORG);
    expect(data.isMember).toBe(false);
    expect(data.isAdmin).toBe(false);
    expect(data.membershipLoadError?.message).toMatch(/could not load your memberships/);
  });
});

describe('the history page', () => {
  it('reads the changes for a signed-out visitor, with no credential', async () => {
    const change = { id: 'chg-1' };
    client.getChanges.mockResolvedValue([change]);

    const { history } = (await loadHistory({})) as { history: Promise<{ changes: unknown[]; loadError: unknown }> };
    const data = await history;

    expect(data.changes).toEqual([change]);
    expect(data.loadError).toBeNull();
    expect(client.getChanges).toHaveBeenCalledWith({ orgKey: 'public-org', applicationKey: 'app', limit: expect.any(Number), offset: 0 });
  });

  it('reads the changes for a signed-in caller', async () => {
    client.getChanges.mockResolvedValue([]);

    const { history } = (await loadHistory({ session: session() })) as { history: Promise<{ changes: unknown[]; loadError: unknown }> };
    const data = await history;

    expect(data.changes).toEqual([]);
    expect(data.loadError).toBeNull();
  });

  it('asks for the changes while the parent layout is still loading', async () => {
    client.getChanges.mockResolvedValue([]);
    const parent = Promise.withResolvers<unknown>();

    const loading = loadHistory({ session: session() }, () => parent.promise);

    expect(client.getChanges).toHaveBeenCalledTimes(1);
    parent.resolve({ version: { version: '2026-01-01' } });
    const data = (await loading) as { versionName: string };
    expect(data.versionName).toBe('2026-01-01');
  });

  it('surfaces the error of a parent layout that fails', async () => {
    client.getChanges.mockResolvedValue([]);

    const thrown = await caughtAsync(() => loadHistory({ session: session() }, () => Promise.reject(refusedWith(404))));

    expect(thrown.status).toBe(404);
  });

  it('refuses a malformed key without asking for the changes', async () => {
    const thrown = await caughtAsync(() => loadHistory({ session: session() }, undefined, '/evil.com'));

    expect(thrown.status).toBe(400);
    expect(client.getChanges).not.toHaveBeenCalled();
  });
});

describe('generated code, signed out', () => {
  const params = { orgKey: 'public-org', appKey: 'app', version: 'latest', generatorKey: 'play' };
  const CODE = { generator_key: 'play', files: [{ name: 'a.scala', contents: 'x' }] };

  function loadGenerator() {
    return generatorLoad({ params, locals: {} } as unknown as Parameters<typeof generatorLoad>[0]);
  }

  it('shows the code of a public application', async () => {
    client.getCode.mockResolvedValue(CODE);

    expect(await loadGenerator()).toEqual({ code: CODE, generatorKey: 'play' });
  });

  it('downloads the code of a public application', async () => {
    client.getCode.mockResolvedValue(CODE);

    const response = await generatorDownload({ params, locals: {} } as unknown as Parameters<typeof generatorDownload>[0]);

    expect(await response.text()).toBe('x');
  });

  it.each([401, 404])('is a 404 when the API answers %i, so a private application cannot be confirmed', async (status) => {
    client.getCode.mockRejectedValue(refusedWith(status));

    const thrown = await caughtAsync(() => loadGenerator());

    expect(thrown.status).toBe(404);
  });
});

describe('search and the site history, signed out', () => {
  it('searches with no credential', async () => {
    const item = { id: 'app-1' };
    client.getItems.mockResolvedValue([item]);

    const data = (await searchLoad({
      url: new URL('https://apibuilder.test/search?q=pets'),
      locals: {}
    } as unknown as Parameters<typeof searchLoad>[0])) as { items: unknown[]; loadError: unknown };

    expect(data.items).toEqual([item]);
    expect(data.loadError).toBeNull();
  });

  it('reads the site history with no credential', async () => {
    client.getChanges.mockResolvedValue([]);

    const data = (await siteHistoryLoad({
      url: new URL('https://apibuilder.test/history'),
      locals: {}
    } as unknown as Parameters<typeof siteHistoryLoad>[0])) as { loadError: unknown };

    expect(data.loadError).toBeNull();
  });
});
