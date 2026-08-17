import { describe, expect, it } from 'vitest';
import { requireAuth, requireAuthForAction } from './auth';
import type { RequestEvent } from '@sveltejs/kit';
import { caught } from '$lib/test-support/throws';
import { session as sessionFixture } from '$lib/test-support/fixtures';

function event(locals: App.Locals, pathname = '/tokens'): RequestEvent {
  return { locals, url: new URL(`http://localhost${pathname}`) } as RequestEvent;
}

const session = sessionFixture();

describe('requireAuth', () => {
  it('returns the session when there is one', () => {
    expect(requireAuth(event({ session }))).toBe(session);
  });

  it('sends a genuinely anonymous request to sign in, keeping where it was going', () => {
    const thrown = caught(() => requireAuth(event({}, '/tokens?page=2')));
    expect(thrown.status).toBe(303);
    expect(thrown.location).toBe('/login?redirect=' + encodeURIComponent('/tokens?page=2'));
  });

  it('does not tell a signed-in user to sign in when the lookup never answered', () => {
    // The cookie may well still be valid: nothing cleared it, we just could not ask. Bouncing
    // them to /login loses their form input and the login call would fail for the same reason.
    const thrown = caught(() => requireAuth(event({ sessionUnavailable: true })));
    expect(thrown.status).toBe(503);
    expect(thrown.body?.message).toBe('We could not reach the server. Please try again in a moment.');
  });
});

describe('requireAuthForAction', () => {
  it('returns the session when there is one', () => {
    expect(requireAuthForAction({ session })).toBe(session);
  });

  it('redirects a genuinely anonymous action to sign in', () => {
    expect(caught(() => requireAuthForAction({})).status).toBe(302);
  });

  it('reports an unavailable lookup rather than a sign-in prompt', () => {
    expect(caught(() => requireAuthForAction({ sessionUnavailable: true })).status).toBe(503);
  });
});
