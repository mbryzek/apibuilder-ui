/**
 * Content-Security-Policy Tests for API Builder UI (ISS-494)
 *
 * The policy moved from a hand-built header in hooks.server.ts into `kit.csp`, dropping
 * `script-src 'unsafe-inline'`. The reason that directive was there in the first place is that
 * SvelteKit injects one inline <script> to boot hydration, and a hand-built header cannot nonce it.
 * So the failure mode of this change is specific and total: the policy blocks that script, no page
 * hydrates, and every page still looks perfectly fine because the SSR'd HTML is intact.
 *
 * These tests are the check that could otherwise only be done by deploying: they assert the served
 * policy, that no CSP violation fires, and that the page really did hydrate. They use /doc/* pages
 * because those render with no API call, so this spec passes with the platform API stopped:
 *
 *   npm run build && npm run preview -- --port 4173
 *   SKIP_DEPENDENCY_CHECK=true HEADLESS=true FRONTEND_BASE_URL=http://localhost:4173 \
 *     npx playwright test playwright/tests/csp.spec.ts
 *
 * Run it against the production build, not just `npm run dev`: SvelteKit forces 'unsafe-inline'
 * into style-src in dev, so a dev-only run cannot see a style-src regression.
 */

import { test, expect, type Page } from '@playwright/test';

declare global {
  interface Window {
    __cspViolations: string[];
    __hydrationProbe?: string;
  }
}

/**
 * Record CSP violations from inside the page. Playwright's init scripts are injected by the
 * browser itself, so this listener is not subject to the policy it is watching.
 */
async function recordCspViolations(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (event) => {
      window.__cspViolations.push(`${event.effectiveDirective} blocked ${event.blockedURI || 'inline'}`);
    });
  });
}

function directive(csp: string, name: string): string {
  const found = csp
    .split(';')
    .map((part) => part.trim())
    .find((part) => part === name || part.startsWith(`${name} `));
  if (!found) throw new Error(`No ${name} directive in: ${csp}`);
  return found;
}

test.describe('Content-Security-Policy', () => {
  test('serves a nonced script-src with no inline escape hatch', async ({ page }) => {
    const response = await page.goto('/doc/start');
    const csp = response?.headers()['content-security-policy'] ?? '';

    const scriptSrc = directive(csp, 'script-src');
    expect(scriptSrc).not.toContain('unsafe-inline');
    expect(scriptSrc).toMatch(/'nonce-[^']+'/);

    // The nonce is per-request, so it is only worth anything if the inline script carries the same
    // one. A mismatch produces exactly the same header and a completely dead page. Read it off the
    // served HTML rather than the DOM: browsers blank the `nonce` content attribute after parsing,
    // so `getAttribute('nonce')` comes back empty even on a script that is running fine.
    const nonce = /'nonce-([^']+)'/.exec(scriptSrc)?.[1];
    const html = (await response?.text()) ?? '';
    expect(html).toContain(`<script nonce="${nonce}">`);
  });

  test('still allows the inline style attributes app.html ships', async ({ page }) => {
    const response = await page.goto('/doc/start');
    const csp = response?.headers()['content-security-policy'] ?? '';

    // A nonce on style-src would void 'unsafe-inline' for style ATTRIBUTES too, and <body> carries
    // style="margin: 0; padding: 0". SvelteKit only adds that nonce when 'unsafe-inline' is absent.
    const styleSrc = directive(csp, 'style-src');
    expect(styleSrc).toContain('unsafe-inline');
    expect(styleSrc).not.toMatch(/'nonce-/);

    await expect(page.locator('body')).toHaveCSS('margin-top', '0px');
  });

  test('hydrates without tripping the policy', async ({ page }) => {
    await recordCspViolations(page);
    await page.goto('/doc/start');

    // Client-side routing is the observable proof of hydration: SvelteKit only intercepts link
    // clicks once its bootstrap has run. If the policy had blocked that script the click would do
    // a full document load and take the probe with it.
    await page.evaluate(() => {
      window.__hydrationProbe = 'survived';
    });
    await page.locator('nav a[href="/doc/why"]').click();
    await page.waitForURL('**/doc/why');

    expect(await page.evaluate(() => window.__hydrationProbe)).toBe('survived');
    expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
  });
});
