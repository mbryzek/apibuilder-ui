import { beforeEach, describe, expect, it, vi } from 'vitest';
import { session } from '$lib/test-support/fixtures';
import { mockApiClients } from '$lib/test-support/mocks';
import { caughtAsync } from '$lib/test-support/throws';

/**
 * What the application Settings page edits.
 *
 * `updateApplicationByAppKey` takes a whole `ApplicationForm` — `{ name, description, visibility }`
 * — so every submission rewrites all three. The page has an Organization and a Service in scope
 * and neither is the Application: seeding the control from the org's visibility offers a value
 * that was never read off the thing being edited, and sending the service's name renames the
 * application to its spec's name. Both are silent, because the request succeeds either way.
 *
 * These assert what the action SENDS, which is the only place the difference is observable.
 */

const LOCALS: App.Locals = { session: session() };

const APPLICATION = {
  id: 'app-1',
  key: 'my-app',
  name: 'My Application',
  description: 'What this application is for',
  visibility: 'public'
};

const client = {
  getMemberships: vi.fn(),
  getApplicationByAppKey: vi.fn(),
  updateApplicationByAppKey: vi.fn()
};

vi.mock('$lib/api/clients', async (importOriginal) => mockApiClients(client, importOriginal));

const { load, actions } = await import('./[orgKey]/[appKey]/[version]/settings/+page.server');

const PARAMS = { orgKey: 'my-org', appKey: 'my-app', version: '1.0.0' };

function invokeUpdate(visibility: string) {
  const body = new FormData();
  body.append('visibility', visibility);
  const event = {
    request: new Request('http://localhost/', { method: 'POST', body }),
    locals: LOCALS,
    params: PARAMS
  };
  return (actions['updateVisibility'] as (e: typeof event) => Promise<unknown>)(event);
}

beforeEach(() => {
  vi.clearAllMocks();
  client.getMemberships.mockResolvedValue([{ id: 'membership-1' }]);
  client.getApplicationByAppKey.mockResolvedValue(APPLICATION);
  client.updateApplicationByAppKey.mockResolvedValue({ ...APPLICATION, visibility: 'organization' });
});

describe('the settings page reads the application it edits', () => {
  it('loads the application, so the control starts on the application visibility', async () => {
    const event = { params: PARAMS, locals: LOCALS, url: new URL('http://localhost/') };
    const data = await (load as (e: typeof event) => Promise<{ application: unknown; applicationLoadError: unknown }>)(event);

    expect(client.getApplicationByAppKey).toHaveBeenCalledWith({ orgKey: 'my-org', appKey: 'my-app' });
    expect(data.application).toEqual(APPLICATION);
    expect(data.applicationLoadError).toBeNull();
  });

  it('reports a failed lookup rather than returning an application nobody read', async () => {
    client.getApplicationByAppKey.mockRejectedValue(new Error('fetch failed'));
    const event = { params: PARAMS, locals: LOCALS, url: new URL('http://localhost/') };
    const data = await (load as (e: typeof event) => Promise<{ application: unknown; applicationLoadError: unknown }>)(event);

    expect(data.application).toBeNull();
    expect(data.applicationLoadError).not.toBeNull();
  });
});

describe('updating visibility changes visibility and nothing else', () => {
  it('preserves the application name and description', async () => {
    await caughtAsync(() => invokeUpdate('organization'));

    expect(client.updateApplicationByAppKey).toHaveBeenCalledWith({
      orgKey: 'my-org',
      appKey: 'my-app',
      body: { name: 'My Application', description: 'What this application is for', visibility: 'organization' }
    });
  });

  it('takes the name from the application rather than from the submitted form', async () => {
    const body = new FormData();
    body.append('visibility', 'organization');
    body.append('name', 'renamed-by-a-stale-page');
    const event = { request: new Request('http://localhost/', { method: 'POST', body }), locals: LOCALS, params: PARAMS };
    await caughtAsync(() => (actions['updateVisibility'] as (e: typeof event) => Promise<unknown>)(event));

    expect(client.updateApplicationByAppKey).toHaveBeenCalledWith(
      expect.objectContaining({ body: expect.objectContaining({ name: 'My Application' }) })
    );
  });

  it('does not write at all when the application cannot be read', async () => {
    client.getApplicationByAppKey.mockRejectedValue(new Error('fetch failed'));

    await invokeUpdate('organization');

    expect(client.updateApplicationByAppKey).not.toHaveBeenCalled();
  });

  it('refuses a visibility that is not one the API declares', async () => {
    await invokeUpdate('everyone-on-the-internet');

    expect(client.updateApplicationByAppKey).not.toHaveBeenCalled();
  });
});
