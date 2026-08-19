import { describe, expect, it, vi } from 'vitest';
import type { Cookies } from '@sveltejs/kit';
import { caught } from '$lib/test-support/throws';
import { FLASH_COOKIE, redirectWithFlash, setFlash, takeFlash } from './flash';

vi.mock('$lib/config', () => ({ SESSION_COOKIE: 'session_id', config: { isProduction: false } }));

interface Jar {
  cookies: Cookies;
  set: Record<string, { value: string; options: Record<string, unknown> }>;
  deleted: string[];
}

function cookieJar(initial: Record<string, string> = {}): Jar {
  const store: Record<string, string> = { ...initial };
  const jar: Jar = { cookies: {} as Cookies, set: {}, deleted: [] };
  jar.cookies = {
    get: (name: string) => store[name],
    set: (name: string, value: string, options: Record<string, unknown>) => {
      store[name] = value;
      jar.set[name] = { value, options };
    },
    delete: (name: string) => {
      delete store[name];
      jar.deleted.push(name);
    }
  } as unknown as Cookies;
  return jar;
}

/**
 * The property under test is that a flash is something the SERVER said. It used to ride in the
 * redirect URL, so `https://<app>/?flash=<any+sentence>&flash_type=error` rendered an attacker's
 * sentence as the app's own toast to a signed-in user — not XSS (Svelte escapes it), but a phishing
 * surface wearing the app's chrome. Nothing here may reintroduce a path from request input to the
 * toast.
 */
describe('flash', () => {
  it('carries the message out of band, leaving the redirect target untouched', () => {
    const jar = cookieJar();

    const thrown = caught(() => redirectWithFlash(jar.cookies, '/account/profile?tab=settings#email', 'Saved'));

    expect(thrown.status).toBe(303);
    expect(thrown.location).toBe('/account/profile?tab=settings#email');
    expect(thrown.location).not.toContain('flash');
  });

  it('sets the flash cookie httpOnly and short-lived so the browser can neither read nor keep it', () => {
    const jar = cookieJar();

    setFlash(jar.cookies, 'Saved', 'error');

    expect(jar.set[FLASH_COOKIE]?.options).toMatchObject({ path: '/', httpOnly: true, sameSite: 'lax' });
    expect(jar.set[FLASH_COOKIE]?.options['maxAge']).toBeLessThanOrEqual(60);
  });

  it('round-trips the message and variant', () => {
    const jar = cookieJar();

    setFlash(jar.cookies, 'Organization deleted', 'error');

    expect(takeFlash(jar.cookies)).toEqual({ message: 'Organization deleted', type: 'error' });
  });

  it('shows a message exactly once', () => {
    const jar = cookieJar();
    setFlash(jar.cookies, 'Email verified');

    expect(takeFlash(jar.cookies)).toEqual({ message: 'Email verified', type: 'success' });
    expect(jar.deleted).toContain(FLASH_COOKIE);
    expect(takeFlash(jar.cookies)).toBeUndefined();
  });

  it('has nothing to show when no flash was set', () => {
    expect(takeFlash(cookieJar().cookies)).toBeUndefined();
  });

  it.each<[string, string]>([
    ['not json at all', 'Your account has been suspended'],
    ['a bare string', '"Your account has been suspended"'],
    ['an array', '["Your account has been suspended"]'],
    ['no message', '{"type":"error"}'],
    ['an empty message', '{"message":"","type":"error"}'],
    ['a non-string message', '{"message":{"toString":"x"},"type":"error"}']
  ])('drops a cookie holding %s rather than rendering it or throwing', (_label, raw) => {
    const jar = cookieJar({ [FLASH_COOKIE]: raw });

    expect(takeFlash(jar.cookies)).toBeUndefined();
    // Cleared either way: a payload we will not render must not sit there being re-read.
    expect(jar.deleted).toContain(FLASH_COOKIE);
  });

  it('falls back to the success variant rather than trusting an unknown one', () => {
    // The variant reaches `class={...}` and `aria-live` in the toast; only the enum is allowed.
    const jar = cookieJar({ [FLASH_COOKIE]: '{"message":"Saved","type":"javascript:alert(1)"}' });

    expect(takeFlash(jar.cookies)).toEqual({ message: 'Saved', type: 'success' });
  });
});
