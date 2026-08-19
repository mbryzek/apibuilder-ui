import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Cookies } from '@sveltejs/kit';
import { session } from '$lib/test-support/fixtures';
import { mockApiClients } from '$lib/test-support/mocks';
import { caughtAsync } from '$lib/test-support/throws';

/**
 * Executed coverage for the two routes that mint and destroy a session (ISS-493).
 *
 * `/logout` and `/login/dev` both changed shape recently — the logout action started revoking the
 * session on the platform rather than only dropping the cookie, `GET /logout` was made inert, and
 * `/login/dev` was gated behind `config.isProduction` — and neither had a test that ran. The e2e
 * suite that would have covered them needs a live platform API, so it only runs on a developer
 * machine (see README). These assert the same invariants against the real route modules with the
 * API client mocked, so `npm run test:unit` / `npm run check` catches a regression without a
 * server.
 *
 * The API client is the only thing stubbed: the real `handleApiCall`, the real `getSessionHeaders`
 * and the real cookie policy in `$lib/server/session` all execute here, because each of them is
 * part of the behavior being pinned.
 */

const config = {
  apiBaseUrl: 'http://localhost:9300',
  tenantId: 'apibuilder',
  appBaseUrl: 'http://localhost:5173',
  environment: 'development',
  isProduction: false
};

vi.mock('$lib/config', () => ({ SESSION_COOKIE: 'session_id', config }));

const platform = {
  deleteTenantSession: vi.fn(),
  getTenantSession: vi.fn()
};

vi.mock('$lib/api/clients', async (importOriginal) => mockApiClients(platform, importOriginal));

// The session id rides on client construction now, so it is the factory call that carries it.
const { clients: clientsFactory, platformClient } = await import('$lib/api/clients');

const { load: logoutLoad, actions: logoutActions } = await import('./logout/+page.server');
const { load: devLoginLoad } = await import('./login/dev/+page.server');

interface CookieJar {
  cookies: Cookies;
  set: Record<string, { value: string; options: Record<string, unknown> }>;
  deleted: string[];
}

function cookieJar(): CookieJar {
  const jar: CookieJar = { cookies: {} as Cookies, set: {}, deleted: [] };
  jar.cookies = {
    set: (name: string, value: string, options: Record<string, unknown>) => {
      jar.set[name] = { value, options };
    },
    delete: (name: string) => {
      jar.deleted.push(name);
    }
  } as unknown as Cookies;
  return jar;
}

const SESSION = session();

beforeEach(() => {
  vi.clearAllMocks();
  config.isProduction = false;
  platform.deleteTenantSession.mockResolvedValue(undefined);
});

describe('GET /logout', () => {
  it('logs nobody out', async () => {
    // SvelteKit's origin check only guards POST form actions, so a state-changing GET here is
    // reachable from any third-party page via `<img src="…/logout">`.
    const thrown = await caughtAsync(() => (logoutLoad as () => unknown)());

    expect(thrown.status).toBe(303);
    expect(thrown.location).toBe('/');
    expect(platform.deleteTenantSession).not.toHaveBeenCalled();
  });
});

describe('POST /logout', () => {
  function logout(jar: CookieJar, locals: App.Locals) {
    const action = logoutActions?.['default'] as (e: { cookies: Cookies; locals: App.Locals }) => Promise<unknown>;
    return action({ cookies: jar.cookies, locals });
  }

  it('revokes the session on the platform, not just in the browser', async () => {
    // The cookie is minted with a one-year maxAge, so any copy of its value (shared machine,
    // proxy log, backup) keeps authenticating for a year unless the platform is told to revoke.
    const jar = cookieJar();

    const thrown = await caughtAsync(() => logout(jar, { session: SESSION }));

    expect(platformClient).toHaveBeenCalledWith({ headers: expect.objectContaining({ session_id: 'sess-1' }) });
    expect(platform.deleteTenantSession).toHaveBeenCalledWith('apibuilder');
    expect(jar.deleted).toEqual(['session_id']);
    expect(thrown.status).toBe(303);
    expect(thrown.location).toBe('/logged-out');
  });

  it('still clears the cookie when revocation fails', async () => {
    // The user asked to be logged out. An unreachable platform must not leave them signed in.
    platform.deleteTenantSession.mockRejectedValue(new Error('fetch failed'));
    const jar = cookieJar();

    const thrown = await caughtAsync(() => logout(jar, { session: SESSION }));

    expect(jar.deleted).toEqual(['session_id']);
    expect(thrown.location).toBe('/logged-out');
  });

  it('does not call the platform for a request that has no session', async () => {
    const jar = cookieJar();

    const thrown = await caughtAsync(() => logout(jar, {}));

    expect(platform.deleteTenantSession).not.toHaveBeenCalled();
    expect(jar.deleted).toEqual(['session_id']);
    expect(thrown.location).toBe('/logged-out');
  });
});

describe('/login/dev', () => {
  function devLogin(jar: CookieJar) {
    return (devLoginLoad as (e: { cookies: Cookies }) => Promise<unknown>)({ cookies: jar.cookies });
  }

  it('does not exist in production', async () => {
    // The route hands the backend the literal session id 'dev' and mints a real cookie from
    // whatever comes back — total account impersonation if the backend ever stops rejecting it.
    config.isProduction = true;
    const jar = cookieJar();

    const thrown = await caughtAsync(() => devLogin(jar));

    expect(thrown.status).toBe(404);
    expect(platform.getTenantSession).not.toHaveBeenCalled();
    expect(jar.set).toEqual({});
  });

  it('mints a session cookie from the dev session outside production', async () => {
    platform.getTenantSession.mockResolvedValue({ session: { id: 'sess-dev' }, user: { id: 'user-dev' } });
    const jar = cookieJar();

    const thrown = await caughtAsync(() => devLogin(jar));

    expect(clientsFactory).toHaveBeenCalledWith({ headers: expect.objectContaining({ session_id: 'dev' }) });
    expect(platform.getTenantSession).toHaveBeenCalledWith('apibuilder');
    expect(jar.set['session_id']?.value).toBe('sess-dev');
    expect(jar.set['session_id']?.options).toMatchObject({ path: '/', httpOnly: true, sameSite: 'lax' });
    expect(thrown.status).toBe(303);
    // The flash rides in an httpOnly cookie, not the URL: anything in the address bar is
    // caller-supplied, so a `?flash=` the layout trusted let any link speak as the app.
    expect(thrown.location).toBe('/');
    expect(JSON.parse(jar.set['flash']?.value ?? 'null')).toEqual({ message: 'Logged in as dev', type: 'success' });
  });

  it('sends the caller back to /login when the dev session is not enabled', async () => {
    platform.getTenantSession.mockRejectedValue(new Error('fetch failed'));
    const jar = cookieJar();

    const thrown = await caughtAsync(() => devLogin(jar));

    expect(jar.set['session_id']).toBeUndefined();
    expect(thrown.location).toBe('/login');
    expect(JSON.parse(jar.set['flash']?.value ?? 'null')).toEqual({ message: 'Developer login not enabled', type: 'error' });
  });
});
