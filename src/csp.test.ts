import { describe, expect, it, vi } from 'vitest';
import svelteConfig from '../svelte.config.js';

/**
 * The Content-Security-Policy moved out of hooks.server.ts and into `kit.csp` (ISS-494).
 *
 * The header used to be hand-built, which meant it had to allow `script-src 'unsafe-inline'` for
 * SvelteKit's hydration bootstrap to run at all -- and that single directive negated the policy.
 * bd4222d had already reasoned *from this line* when it removed the session id from the page
 * payload; the mitigation it relied on was never actually put in place.
 *
 * These assert the two directives that are easy to get backwards in opposite directions, and that
 * the move to `kit.csp` did not quietly drop any of the coverage the old header had.
 */

const directives = svelteConfig.kit?.csp?.directives ?? {};

describe('page CSP (kit.csp)', () => {
  it('does not allow inline script', () => {
    // The whole point of the issue. `script-src` must also exist and be non-empty: SvelteKit only
    // adds its nonce to a directive that is already declared (csp.js `script_needs_csp`), so
    // deleting it and relying on `default-src` would leave the bootstrap script unnonced.
    expect(directives['script-src']).toEqual(['self']);
    expect(directives['script-src']).not.toContain('unsafe-inline');
  });

  it('still allows inline style', () => {
    // Counterintuitive, and the most likely thing for a later pass to "fix". SvelteKit adds a
    // nonce to style-src only when the directive does not already allow inline styles, and a
    // nonce there voids 'unsafe-inline' for style ATTRIBUTES as well -- app.html carries
    // style="margin: 0; padding: 0" on <body>, which would stop applying.
    expect(directives['style-src']).toContain('unsafe-inline');
  });

  it('is rendered with a per-request nonce, not a build-time hash', () => {
    // 'auto' means nonce for SSR pages and hash for prerendered ones. Nothing prerenders today, so
    // this is the nonce path; 'hash' would silently stop protecting dynamically rendered pages.
    expect(svelteConfig.kit?.csp?.mode).toBe('auto');
  });

  it('keeps every directive the hand-built header carried', () => {
    // The move is a tightening, not a trade: nothing that was covered before is uncovered now.
    for (const directive of [
      'default-src',
      'script-src',
      'style-src',
      'font-src',
      'img-src',
      'connect-src',
      'frame-ancestors',
      'base-uri',
      'form-action'
    ]) {
      expect(directives).toHaveProperty(directive);
    }
  });

  it('allows the Google Fonts origins the app actually loads from', () => {
    expect(directives['style-src']).toContain('https://fonts.googleapis.com');
    expect(directives['font-src']).toContain('https://fonts.gstatic.com');
  });
});

vi.mock('$lib/api/clients', () => ({
  clients: () => ({}),
  getSessionHeaders: () => ({})
}));

const { handle } = await import('./hooks.server');

/** Run the hook over an anonymous request and hand back the headers it left on the response. */
async function headersFor(resolved = new Response('ok')): Promise<Headers> {
  const event = { cookies: { get: () => undefined }, locals: {} };
  const res = await (handle as unknown as (input: { event: typeof event; resolve: () => Promise<Response> }) => Promise<Response>)({
    event,
    resolve: async () => resolved
  });
  return res.headers;
}

describe('hooks.server CSP', () => {
  it('does not touch the policy SvelteKit already set on a page', async () => {
    // SvelteKit sets this itself, with the nonce its bootstrap script runs under. Overwriting it
    // -- which an unconditional `headers.set` here would do -- strips the nonce and leaves every
    // page with dead JavaScript.
    const page = new Response('<html></html>');
    page.headers.set('content-security-policy', "script-src 'self' 'nonce-abc123'");

    expect(await (await headersFor(page)).get('content-security-policy')).toBe("script-src 'self' 'nonce-abc123'");
  });

  it('locks down responses SvelteKit did not render', async () => {
    // The +server.ts endpoints (service.json, original, download, example) return JSON or text and
    // never load a subresource, so they get the strictest policy rather than no policy.
    expect(await (await headersFor()).get('content-security-policy')).toBe(
      "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
    );
  });

  it('still sets the other security headers on every response', async () => {
    const headers = await headersFor();
    expect(headers.get('x-frame-options')).toBe('DENY');
    expect(headers.get('x-content-type-options')).toBe('nosniff');
    expect(headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(headers.get('permissions-policy')).toBe('camera=(), microphone=(), geolocation=()');
  });
});
