import type { Cookies } from '@sveltejs/kit';
import { SESSION_COOKIE, config } from '$lib/config';

/**
 * Single source of truth for the session cookie policy.
 *
 * Every login path (password login, dev login, signup, GitHub callback, password reset)
 * sets the session cookie with identical options; every logout path clears it identically.
 * Keeping that policy in one place avoids drift (e.g. one path forgetting `httpOnly` or a
 * different `maxAge`) as new auth entry points are added.
 */

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function setSessionCookie(cookies: Cookies, sessionId: string): void {
  cookies.set(SESSION_COOKIE, sessionId, {
    path: '/',
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS
  });
}

export function clearSessionCookie(cookies: Cookies): void {
  cookies.delete(SESSION_COOKIE, { path: '/' });
}
