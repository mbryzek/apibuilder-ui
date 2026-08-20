/**
 * Signup and Login Tests for API Builder UI
 */

import { test, expect } from '@playwright/test';
import { config } from '../config';
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

  test("refuses a signup with no email, in the app's own words", async ({ page }) => {
    await loadUrl(page, '/signup');

    await fillField(page, 'input[name="password"]', 'testpassword123');
    await safeClick(page, 'Create account');

    // The browser does NOT block this: no field carries `required`, deliberately, so the server is
    // the one judge of what a submission needs and its message is the one the user sees — styled,
    // translatable and logged, rather than a native bubble the app cannot reach.
    const errorMessage = page.locator('.bg-red-50');
    await errorMessage.waitFor({ state: 'visible', timeout: 10000 });
    expect(await errorMessage.textContent()).toContain('Email and password are required');
    await expect(page).toHaveURL(/\/signup/);
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

  test('lands on the redirect target with its query string intact and no flash in the URL', async ({ page }) => {
    // Two invariants at once. The redirect target is emitted verbatim, so an existing query string
    // survives; and the flash rides in an httpOnly cookie, so nothing about the message appears in
    // the address bar — a `?flash=` the layout trusted let any link render its own text as our toast.
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
    expect(url.pathname).toBe('/account/profile');
    expect(url.searchParams.get('tab')).toBe('settings');
    expect(url.search).not.toContain('flash');

    // The toast is what the server sent, delivered out of band.
    await expect(page.getByRole('status')).toContainText('Welcome back!');
  });

  test("does not render a flash query param as the app's own toast", async ({ page }) => {
    // A crafted link is request input; only a message this server sent may wear the app's chrome.
    await loadUrl(page, '/?flash=Your+account+has+been+suspended&flash_type=error');

    await expect(page.getByRole('status')).toHaveCount(0);
    await expect(page.getByText('Your account has been suspended')).toHaveCount(0);
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

    // The route's OWN redirect, unfollowed. Following it lands wherever `/` sends this user, and
    // that depends on how many organizations they have — a fresh signup has none, so `/` forwards
    // again to /org/create and an assertion on the final pathname is about the org list rather
    // than about logout. `page.request` carries the page's cookies, so the session is the same one.
    const res = await page.request.get(`${config.FRONTEND_BASE_URL}/logout`, { maxRedirects: 0 });
    expect(res.status()).toBe(303);
    expect(res.headers()['location']).toBe('/');
    expect(await sessionIsValid(sessionId)).toBe(true);
  });
});
