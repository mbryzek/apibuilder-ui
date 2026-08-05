/**
 * Signup and Login Tests for API Builder UI
 */

import { test, expect } from '@playwright/test';
import {
  generateRandomEmail,
  fillField,
  loadUrl,
  waitForCondition,
  createUserViaApi,
  safeClick,
  sessionIsValid,
  signupAndLogin
} from '../utils/test-helpers';

test.describe('Signup', () => {
  test('creates a new account and redirects to org create', async ({ page }) => {
    const email = generateRandomEmail();
    const password = 'testpassword123';

    await loadUrl(page, '/signup');

    await fillField(page, 'input[name="email"]', email);
    await fillField(page, 'input[name="password"]', password);
    await safeClick(page, 'Create account');

    await waitForCondition(() => !page.url().includes('/signup'), { description: 'navigation away from signup page', maxAttempts: 20 });

    // Should redirect away from signup (to home)
    expect(page.url()).not.toContain('/signup');
  });

  test('shows error for duplicate email', async ({ page }) => {
    const email = generateRandomEmail();
    const password = 'testpassword123';

    // Create user via API first
    await createUserViaApi(email, password);

    await loadUrl(page, '/signup');

    await fillField(page, 'input[name="email"]', email);
    await fillField(page, 'input[name="password"]', password);
    await safeClick(page, 'Create account');

    // Should show error about duplicate email
    const errorMessage = page.locator('.bg-red-50');
    await errorMessage.waitFor({ state: 'visible', timeout: 10000 });
    const errorText = await errorMessage.textContent();
    expect(errorText).toBeTruthy();
  });

  test('shows error for missing email', async ({ page }) => {
    await loadUrl(page, '/signup');

    await fillField(page, 'input[name="password"]', 'testpassword123');
    await safeClick(page, 'Create account');

    // Browser validation should prevent submission (email has required attribute)
    const stillOnSignup = page.url().includes('/signup');
    expect(stillOnSignup).toBe(true);
  });
});

test.describe('Login', () => {
  test('logs in with valid credentials', async ({ page }) => {
    const email = generateRandomEmail();
    const password = 'testpassword123';

    // Create user via API first
    await createUserViaApi(email, password);

    await loadUrl(page, '/login');

    await fillField(page, 'input[name="email"]', email);
    await fillField(page, 'input[name="password"]', password);
    await safeClick(page, 'Sign in');

    await waitForCondition(() => !page.url().includes('/login'), { description: 'navigation away from login page', maxAttempts: 20 });

    expect(page.url()).not.toContain('/login');
  });

  test('preserves redirect target query string and shows flash after login', async ({ page }) => {
    // Pins the fix for the double-`?` bug: when the redirect target already carries
    // a query string, the login redirect must append flash params with `&`, not a
    // second `?`, so both the flash and the original params survive.
    const email = generateRandomEmail();
    const password = 'testpassword123';
    await createUserViaApi(email, password);

    const redirectTarget = '/account/profile?tab=settings';
    await loadUrl(page, `/login?redirect=${encodeURIComponent(redirectTarget)}`);

    await fillField(page, 'input[name="email"]', email);
    await fillField(page, 'input[name="password"]', password);
    await safeClick(page, 'Sign in');

    await waitForCondition(() => !page.url().includes('/login'), { description: 'navigation away from login page', maxAttempts: 20 });

    const url = new URL(page.url());
    // Original query param must survive (not corrupted by a second `?`).
    expect(url.searchParams.get('tab')).toBe('settings');
    // Flash must be parseable (would be swallowed if concatenated with a second `?`).
    // The layout strips flash params after showing the toast, so it may already be gone;
    // the invariant we pin is that `tab` is never mangled into `settings?flash=...`.
    expect(url.searchParams.get('tab')).not.toContain('flash');
    expect(url.pathname).toBe('/account/profile');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await loadUrl(page, '/login');

    await fillField(page, 'input[name="email"]', 'nonexistent@example.com');
    await fillField(page, 'input[name="password"]', 'wrongpassword');
    await safeClick(page, 'Sign in');

    const errorMessage = page.locator('.bg-red-50');
    await errorMessage.waitFor({ state: 'visible', timeout: 10000 });
    const errorText = await errorMessage.textContent();
    expect(errorText).toBeTruthy();
  });

  test('signup then login flow', async ({ page }) => {
    const email = generateRandomEmail();
    const password = 'testpassword123';

    // Sign up
    await loadUrl(page, '/signup');
    await fillField(page, 'input[name="name"]', 'Test User');
    await fillField(page, 'input[name="email"]', email);
    await fillField(page, 'input[name="password"]', password);
    await safeClick(page, 'Create account');

    await waitForCondition(() => !page.url().includes('/signup'), { description: 'navigation away from signup page', maxAttempts: 20 });

    // Log out by clearing cookies
    await page.context().clearCookies();

    // Log in with same credentials
    await loadUrl(page, '/login');
    await fillField(page, 'input[name="email"]', email);
    await fillField(page, 'input[name="password"]', password);
    await safeClick(page, 'Sign in');

    await waitForCondition(() => !page.url().includes('/login'), { description: 'navigation away from login page', maxAttempts: 20 });

    expect(page.url()).not.toContain('/login');
  });
});

test.describe('Logout', () => {
  test('the logout form revokes the session on the platform', async ({ page }) => {
    // Clearing the cookie is not logging out: the cookie is minted with a one-year maxAge, so any
    // copy of its value keeps authenticating until the platform is told to revoke it. Both halves
    // are asserted — the browser forgets the session AND the id itself stops working.
    const { email, sessionId } = await signupAndLogin(page);
    expect(await sessionIsValid(sessionId)).toBe(true);

    await loadUrl(page, '/');
    await page.getByRole('button', { name: email }).click();
    await page.locator('form[action="/logout"] button').first().click();

    await page.waitForURL('**/logged-out');
    await expect(page.getByRole('heading', { name: 'You are now logged out' })).toBeVisible();
    expect(await sessionIsValid(sessionId)).toBe(false);
  });

  test('GET /logout logs nobody out', async ({ page }) => {
    // SvelteKit's origin check only guards POST form actions, so a state-changing GET here would
    // be reachable from any third-party page via `<img src=".../logout">`.
    const { sessionId } = await signupAndLogin(page);

    await loadUrl(page, '/logout');

    expect(new URL(page.url()).pathname).toBe('/');
    expect(await sessionIsValid(sessionId)).toBe(true);
  });
});
