/**
 * The browser suite runs post-merge and does not gate a merge (see "Where the Playwright suite
 * runs" in README.md), so the two helpers that talk to the platform API are pinned here instead,
 * under vitest, inside `ci`: these assert the request each one puts on the wire and how it reads
 * the answer.
 *
 * That is the part the generated client changed. If a spec change moves the signup route, the
 * body shape, or the session-state union, `tsc` catches the type half and these catch the rest.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { config } from '../config';
import { createUserViaApi, sessionIsValid } from './test-helpers';

type FetchArgs = [string, RequestInit];

function stubFetch(...responses: Response[]): { calls: FetchArgs[] } {
  const calls: FetchArgs[] = [];
  const fetchStub = vi.fn((url: string, init: RequestInit) => {
    calls.push([url, init]);
    const next = responses.shift();
    if (!next) throw new Error(`Unexpected fetch call to ${url}`);
    return Promise.resolve(next);
  });
  vi.stubGlobal('fetch', fetchStub);
  return { calls };
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

const TENANT_SESSION = {
  discriminator: 'tenant_session',
  session: { id: 'sess-1' },
  user: { id: 'usr-1' }
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createUserViaApi', () => {
  it('posts the signup form to the tenant signup route and returns the session', async () => {
    const { calls } = stubFetch(json(201, TENANT_SESSION));

    const session = await createUserViaApi('someone@test.apibuilder.io', 'testpassword');

    expect(session.session.id).toBe('sess-1');
    expect(calls).toHaveLength(1);

    const [url, init] = calls[0]!;
    // Against `config`, not a literal: the base url comes from BACKEND_BASE_URL / API_BASE_URL, so
    // a hardcoded host turns `npm run check` red for anyone whose shell exports either — which is
    // exactly the shell of someone running the e2e suite against a non-default backend.
    expect(url).toBe(`${config.API_BASE_URL}/tenant/apibuilder/session/signups`);
    expect(init.method).toBe('POST');
    // Without the bypass, a full run's burst of signups is rate-limited.
    expect(init.headers).toMatchObject({ 'X-Bypass-Rate-Limit': 'true' });
    expect(JSON.parse(String(init.body))).toEqual({
      user: { person: { email: 'someone@test.apibuilder.io' } },
      password: 'testpassword'
    });
  });

  it('sends a name only when one was given, never an explicit undefined', async () => {
    const { calls } = stubFetch(json(201, TENANT_SESSION), json(201, TENANT_SESSION));

    await createUserViaApi('a@test.apibuilder.io', 'pw', 'A Name');
    await createUserViaApi('b@test.apibuilder.io', 'pw');

    expect(JSON.parse(String(calls[0]![1].body)).user.person).toEqual({
      email: 'a@test.apibuilder.io',
      name: 'A Name'
    });
    expect(Object.keys(JSON.parse(String(calls[1]![1].body)).user.person)).toEqual(['email']);
  });

  it('fails loudly when signup answers a variant that carries no session', async () => {
    // `user_inactive` has no `session` field at all; the old hand-rolled helper declared one
    // and would have handed a caller `undefined.id`.
    stubFetch(json(201, { discriminator: 'user_inactive', status: 'inactive' }));

    await expect(createUserViaApi('c@test.apibuilder.io', 'pw')).rejects.toThrow('user_inactive');
  });

  it('surfaces a rejected signup rather than returning a broken session', async () => {
    stubFetch(json(422, [{ discriminator: 'validation', message: 'Email is already registered' }]));

    await expect(createUserViaApi('d@test.apibuilder.io', 'pw')).rejects.toThrow();
  });
});

describe('sessionIsValid', () => {
  it('asks the platform with the session id and reports a live session', async () => {
    const { calls } = stubFetch(json(200, TENANT_SESSION));

    expect(await sessionIsValid('sess-1')).toBe(true);

    const [url, init] = calls[0]!;
    expect(url).toBe(`${config.API_BASE_URL}/tenant/apibuilder/session`);
    expect(init.method).toBe('GET');
    expect(init.headers).toMatchObject({ session_id: 'sess-1', 'X-Bypass-Rate-Limit': 'true' });
  });

  it('reports a session the platform no longer accepts', async () => {
    stubFetch(json(401, { discriminator: 'unauthorized', message: 'Not authorized' }));

    expect(await sessionIsValid('sess-1')).toBe(false);
  });

  it('throws when the platform is broken, rather than calling it a logout', async () => {
    // A 500 read as `false` would let an outage satisfy a logout assertion.
    stubFetch(json(500, { message: 'boom' }));

    await expect(sessionIsValid('sess-1')).rejects.toThrow();
  });
});
