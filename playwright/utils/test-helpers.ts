/**
 * Test Helper Utilities
 * Common functions used across API Builder UI test files
 */

import fs from "fs";
import path from "path";
import type { Page } from "@playwright/test";
import { config } from "../config";
import type { ContextOrPage } from "../types";

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
 * Returns a TenantSession with session and user
 */
export async function createUserViaApi(
  email: string,
  password: string,
  name?: string,
): Promise<{ session: { id: string }; user: { id: string } }> {
  const person: Record<string, string> = { email };
  if (name) person['name'] = name;

  const response = await fetch(`${config.API_BASE_URL}/tenant/${config.TENANT_ID}/session/signups`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Bypass-Rate-Limit": "true" },
    body: JSON.stringify({ user: { person }, password }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to create user via API: ${response.status} ${errorBody}`);
  }

  return response.json();
}

/**
 * API Helper: Authenticate a user via the platform login endpoint
 */
export async function authenticateViaApi(
  email: string,
  password: string,
): Promise<{ session: { id: string }; user: { id: string } }> {
  const response = await fetch(`${config.API_BASE_URL}/tenant/${config.TENANT_ID}/session/logins`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Bypass-Rate-Limit": "true" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to authenticate via API: ${response.status} ${errorBody}`);
  }

  return response.json();
}

/**
 * Set session cookie in browser context
 */
export async function setSessionCookie(
  context: ContextOrPage,
  sessionId: string,
): Promise<void> {
  const cookieContext = "context" in context ? context.context() : context;

  await cookieContext.addCookies([
    {
      name: "session_id",
      value: sessionId,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(
  page: Page,
  name: string,
): Promise<string | undefined> {
  if (!config.SCREENSHOTS.enabled) return;

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${name}-${timestamp}.png`;
  const filepath = path.join(config.SCREENSHOTS.path, filename);

  if (!fs.existsSync(config.SCREENSHOTS.path)) {
    fs.mkdirSync(config.SCREENSHOTS.path, { recursive: true });
  }

  await page.screenshot({
    path: filepath,
    fullPage: config.SCREENSHOTS.fullPage,
  });

  console.log(`        Screenshot: ${filepath}`);
  return filepath;
}

/**
 * Fill form field with retry for hydration
 */
export async function fillField(
  page: Page,
  selector: string,
  value: string,
): Promise<void> {
  await page.waitForSelector(selector, { state: "visible" });

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
    throw new Error(
      `Failed to fill field ${selector}. Expected: ${value}, Got: ${actualValue}`,
    );
  }
}

/**
 * Navigate to a URL and wait for page to load
 */
export async function loadUrl(page: Page, urlPath: string): Promise<void> {
  const url = urlPath.startsWith("http")
    ? urlPath
    : `${config.FRONTEND_BASE_URL}${urlPath}`;

  const response = await page.goto(url);

  if (!response) {
    throw new Error(`Failed to load ${url}: No response received`);
  }

  const status = response.status();
  if (status !== 200) {
    throw new Error(
      `Failed to load ${url}: Expected HTTP 200 but got ${status}`,
    );
  }

  try {
    await page.waitForLoadState("networkidle", { timeout: 1500 });
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
  } = {},
): Promise<void> {
  const intervalMs = options.intervalMs || 250;
  const maxAttempts = options.maxAttempts || 10;
  const description = options.description || "condition to be met";

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await conditionFn();
    if (result) {
      return;
    }

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  throw new Error(
    `Timeout waiting for ${description} after ${maxAttempts} attempts (${maxAttempts * intervalMs}ms)`,
  );
}

/**
 * Safe click on a button with the given label text
 */
export async function safeClick(
  page: Page,
  buttonLabel: string,
): Promise<boolean> {
  const retries = 3;
  const timeout = config.TIMEOUTS.action;
  const selector = `button:has-text("${buttonLabel}")`;

  for (let i = 0; i < retries; i++) {
    try {
      await page.waitForSelector(selector, { timeout, state: "visible" });
      await page.click(selector, { timeout });
      return true;
    } catch (error) {
      if (i === retries - 1) {
        await takeScreenshot(page, "click-failed");
        throw new Error(`Button with text '${buttonLabel}' not found`);
      }
      await page.waitForTimeout(250);
    }
  }
  return false;
}
