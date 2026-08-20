import { describe, expect, it, vi } from 'vitest';
import type { Cookies } from '@sveltejs/kit';
import { completeSession } from './auth-completion';
import type { SessionState } from '$generated/com-bryzek-platform';
import type { ApiResponse } from '$lib/api/error-handler';
import { ok, failed } from '$lib/test-support/api-responses';
import { caught } from '$lib/test-support/throws';

function cookies(): Cookies {
  return { set: vi.fn(), get: vi.fn(), delete: vi.fn(), getAll: vi.fn(), serialize: vi.fn() } as unknown as Cookies;
}

const tenantSession = ok({
  discriminator: 'tenant_session',
  session: { id: 'sess-1' },
  user: { id: 'usr-1' }
}) as ApiResponse<SessionState>;

describe('completeSession', () => {
  it('sets the session cookie and redirects on a session', () => {
    const jar = cookies();

    const thrown = caught(() => completeSession(jar, tenantSession, '/next', 'Welcome'));

    expect(thrown.status).toBe(303);
    expect(thrown.location).toBe('/next');
    expect(jar.set).toHaveBeenCalled();
  });

  it('says the account is inactive rather than that the server broke', () => {
    const response = ok({ discriminator: 'user_inactive' }) as ApiResponse<SessionState>;

    const failure = completeSession(cookies(), response, '/next', 'Welcome');

    expect(failure.status).toBe(403);
    expect(JSON.stringify(failure.data)).toContain('not active');
  });

  it('reports the API failure in the API’s own words', () => {
    const failure = completeSession(cookies(), failed(422, 'Email is already registered'), '/next', 'Welcome');

    expect(failure.status).toBe(422);
    expect(JSON.stringify(failure.data)).toContain('Email is already registered');
  });

  it('refuses a variant it does not know instead of pretending it signed someone in', () => {
    // The compile-time half is `unhandledSessionState(_state: never)`: a third variant added to the
    // generated union stops type-checking here. This is the runtime half — no cookie is set for a
    // state this module cannot read.
    const jar = cookies();
    const response = ok({ discriminator: 'something_new' } as unknown) as ApiResponse<SessionState>;

    const failure = completeSession(jar, response, '/next', 'Welcome');

    expect(failure.status).toBe(500);
    expect(jar.set).not.toHaveBeenCalled();
  });
});
