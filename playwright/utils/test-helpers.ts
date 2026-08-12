/**
 * Test Helper Utilities
 * Common functions used across API Builder UI test files
 */

import fs from 'fs';
import path from 'path';
import type { Page } from '@playwright/test';
import { config } from '../config';
import type { ContextOrPage } from '../types';
import { ApiClient as PlatformClient, isTenantSession } from '../generated/com-bryzek-platform';
import type { PersonForm, TenantSession } from '../generated/com-bryzek-platform';
import { UnauthorizedErrorResponse } from '../generated/generated-error-unauthorized-error-response';
import { VoidResponse } from '../generated/generated-error-void-response';

/** Password used for every throwaway account `signupAndLogin` creates. */
const TEST_PASSWORD = 'testpassword';

/**
 * The platform client the specs talk to, generated from the same apibuilder specs the app is
 * built against. Hand-rolled `fetch()` calls were typed by hand and could not notice the
 * contract moving underneath them — signup returns a `SessionState` union, not the
 * `{ session, user }` object the old helper declared.
 */
const platform = new PlatformClient(config.API_BASE_URL);

/** A full run signs up dozens of throwaway accounts; without this the platform rate-limits it. */
const BYPASS_RATE_LIMIT: Record<string, string> = { 'X-Bypass-Rate-Limit': 'true' };

/**
 * Generate a random UUID
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Generate a unique test email
 */
export function generateRandomEmail(): string {
  return `playwright-${generateUUID()}@test.apibuilder.io`;
}

/**
 * API Helper: Create a user via the platform signup endpoint
 *
 * Signup answers a `SessionState`, so an inactive user comes back as a variant carrying no
 * session at all. Fail loudly here rather than letting a caller read `.session.id` off it.
 */
export async function createUserViaApi(email: string, password: string, name?: string): Promise<TenantSession> {
  const person: PersonForm = name ? { email, name } : { email };

  const state = await platform.createTenantSessionSignups({
    tenantId: config.TENANT_ID,
    body: { user: { person }, password },
    headers: BYPASS_RATE_LIMIT
  });

  if (!isTenantSession(state)) {
    throw new Error(`Signup for ${email} returned '${state.discriminator}' rather than a session`);
  }

  return state;
}

/**
 * API Helper: ask the platform whether a session id still authenticates.
 *
 * The only way to tell a real logout from a cleared cookie: the browser has forgotten the id
 * either way, so the assertion has to be made against the platform.
 */
export async function sessionIsValid(sessionId: string): Promise<boolean> {
  try {
    await platform.getTenantSession(config.TENANT_ID, {
      headers: { ...BYPASS_RATE_LIMIT, session_id: sessionId }
    });
    return true;
  } catch (error) {
    // Only the platform saying "not you" answers the question. Anything else — a 500, a
    // connection refused — is the platform being broken, and reading that as "logged out"
    // would turn an outage into a passing logout assertion.
    if (error instanceof UnauthorizedErrorResponse || error instanceof VoidResponse) {
      return false;
    }
    throw error;
  }
}

/**
 * Create a throwaway user and put its session in the browser, the way every authenticated spec
 * starts. Returns the pieces a caller may need to assert against the platform afterwards.
 */
export async function signupAndLogin(page: Page): Promise<{ email: string; sessionId: string }> {
  const email = generateRandomEmail();
  const result = await createUserViaApi(email, TEST_PASSWORD);
  await setSessionCookie(page, result.session.id);
  return { email, sessionId: result.session.id };
}

/**
 * Set session cookie in browser context
 */
export async function setSessionCookie(context: ContextOrPage, sessionId: string): Promise<void> {
  const cookieContext = 'context' in context ? context.context() : context;

  await cookieContext.addCookies([
    {
      name: 'session_id',
      value: sessionId,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax'
    }
  ]);
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(page: Page, name: string): Promise<string | undefined> {
  if (!config.SCREENSHOTS.enabled) return;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  const filepath = path.join(config.SCREENSHOTS.path, filename);

  if (!fs.existsSync(config.SCREENSHOTS.path)) {
    fs.mkdirSync(config.SCREENSHOTS.path, { recursive: true });
  }

  await page.screenshot({
    path: filepath,
    fullPage: config.SCREENSHOTS.fullPage
  });

  console.log(`        Screenshot: ${filepath}`);
  return filepath;
}

/**
 * Fill form field with retry for hydration
 */
export async function fillField(page: Page, selector: string, value: string): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible' });

  for (let attempt = 0; attempt < 3; attempt++) {
    await page.fill(selector, value);
    await page.waitForTimeout(150);

    const actualValue = await page.inputValue(selector);
    if (actualValue === value) {
      return;
    }

    await page.waitForTimeout(500);
  }

  const actualValue = await page.inputValue(selector);
  if (actualValue !== value) {
    throw new Error(`Failed to fill field ${selector}. Expected: ${value}, Got: ${actualValue}`);
  }
}

/**
 * Navigate to a URL and wait for page to load
 */
export async function loadUrl(page: Page, urlPath: string): Promise<void> {
  const url = urlPath.startsWith('http') ? urlPath : `${config.FRONTEND_BASE_URL}${urlPath}`;

  const response = await page.goto(url);

  if (!response) {
    throw new Error(`Failed to load ${url}: No response received`);
  }

  const status = response.status();
  if (status !== 200) {
    throw new Error(`Failed to load ${url}: Expected HTTP 200 but got ${status}`);
  }

  try {
    await page.waitForLoadState('networkidle', { timeout: 1500 });
  } catch {
    // networkidle not reached — page is still usable
  }
}

/**
 * Wait for a condition to be met by polling
 */
export async function waitForCondition(
  conditionFn: () => boolean | Promise<boolean>,
  options: {
    intervalMs?: number;
    maxAttempts?: number;
    description?: string;
  } = {}
): Promise<void> {
  const intervalMs = options.intervalMs || 250;
  const maxAttempts = options.maxAttempts || 10;
  const description = options.description || 'condition to be met';

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await conditionFn();
    if (result) {
      return;
    }

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  throw new Error(`Timeout waiting for ${description} after ${maxAttempts} attempts (${maxAttempts * intervalMs}ms)`);
}

/**
 * Safe click on a button with the given label text
 */
export async function safeClick(page: Page, buttonLabel: string): Promise<boolean> {
  const retries = 3;
  const timeout = config.TIMEOUTS.action;
  const selector = `button:has-text("${buttonLabel}")`;

  for (let i = 0; i < retries; i++) {
    try {
      await page.waitForSelector(selector, { timeout, state: 'visible' });
      await page.click(selector, { timeout });
      return true;
    } catch (error) {
      if (i === retries - 1) {
        await takeScreenshot(page, 'click-failed');
        // Carry the Playwright error forward — "not found" alone hides whether the button was
        // missing, hidden, or covered by something else.
        throw new Error(`Button with text '${buttonLabel}' not found: ${error instanceof Error ? error.message : String(error)}`);
      }
      await page.waitForTimeout(250);
    }
  }
  return false;
}
