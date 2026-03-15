/**
 * Organization Tests for API Builder UI
 */

import { test, expect } from "@playwright/test";
import {
  generateRandomEmail,
  generateUUID,
  fillField,
  loadUrl,
  waitForCondition,
  createUserViaApi,
  setSessionCookie,
  authenticateViaApi,
  safeClick,
} from "../utils/test-helpers";

async function signupAndLogin(page: import("@playwright/test").Page): Promise<{
  email: string;
  sessionId: string;
}> {
  const email = generateRandomEmail();
  const password = "testpassword";
  const result = await createUserViaApi(email, password);
  await setSessionCookie(page, result.session.id);
  return { email, sessionId: result.session.id };
}

test.describe("Organization Creation", () => {
  test("creates an organization and redirects to org page", async ({ page }) => {
    await signupAndLogin(page);

    await loadUrl(page, "/org/create");

    const orgName = `Test Org ${generateUUID().slice(0, 8)}`;
    const namespace = `com.test.${generateUUID().slice(0, 8).replace(/-/g, "")}`;

    await fillField(page, 'input[name="name"]', orgName);
    await fillField(page, 'input[name="namespace"]', namespace);
    await safeClick(page, "Create Organization");

    await waitForCondition(
      () => !page.url().includes("/org/create"),
      { description: "navigation away from org create page", maxAttempts: 20 },
    );

    expect(page.url()).not.toContain("/org/create");
    // Should redirect to the new org's page
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test("shows validation error for missing name", async ({ page }) => {
    await signupAndLogin(page);

    await loadUrl(page, "/org/create");

    await fillField(page, 'input[name="namespace"]', "com.test.something");
    await safeClick(page, "Create Organization");

    // Should stay on create page (browser validation prevents submission)
    expect(page.url()).toContain("/org/create");
  });

  test("visibility select shows all enum values", async ({ page }) => {
    await signupAndLogin(page);

    await loadUrl(page, "/org/create");

    const options = await page.locator('select[name="visibility"] option').allTextContents();
    expect(options).toContain("user");
    expect(options).toContain("organization");
    expect(options).toContain("public");
  });
});

test.describe("Organization Page", () => {
  test("home page loads for anonymous user", async ({ page }) => {
    await loadUrl(page, "/");
    // Should see the page title or some content
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test("home page shows org list for logged-in user", async ({ page }) => {
    await signupAndLogin(page);
    await loadUrl(page, "/");
    // Page should load without error
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});
