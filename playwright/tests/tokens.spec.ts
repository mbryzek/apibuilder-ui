/**
 * Token Tests for API Builder UI
 */

import { test, expect } from "@playwright/test";
import {
  generateRandomEmail,
  createUserViaApi,
  setSessionCookie,
  loadUrl,
  safeClick,
  waitForCondition,
} from "../utils/test-helpers";

async function signupAndLogin(page: import("@playwright/test").Page): Promise<void> {
  const email = generateRandomEmail();
  const result = await createUserViaApi(email, "testpassword");
  await setSessionCookie(page, result.session.id);
}

test.describe("Tokens", () => {
  test("creates a token and shows cleartext token on detail page", async ({ page, context }) => {
    await signupAndLogin(page);

    await loadUrl(page, "/tokens/create");

    // Fill optional description
    const descriptionInput = page.locator('input[name="description"], textarea[name="description"]');
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill("Test token from Playwright");
    }

    await safeClick(page, "Create Token");

    // Should redirect to token detail page /tokens/{guid}
    await waitForCondition(
      () => !page.url().includes("/tokens/create"),
      { description: "navigation away from token create page", maxAttempts: 30 },
    );

    expect(page.url()).toMatch(/\/tokens\/[^/]+$/);
    expect(page.url()).not.toContain("/tokens/create");

    // Should see the cleartext token on the page
    const tokenCode = page.locator("code");
    await tokenCode.waitFor({ state: "visible", timeout: 5000 });
    const tokenText = await tokenCode.textContent();
    expect(tokenText).toBeTruthy();
    expect(tokenText!.trim().length).toBeGreaterThan(10);

    // Grant clipboard permissions and copy token
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await tokenCode.click();

    // Verify the token text is selectable (has select-all class)
    const selectAllClass = await tokenCode.getAttribute("class");
    expect(selectAllClass).toContain("select-all");
  });

  test("token cleartext is hidden on second visit", async ({ page, context }) => {
    await signupAndLogin(page);

    await loadUrl(page, "/tokens/create");

    const descriptionInput = page.locator('input[name="description"], textarea[name="description"]');
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill("Single view test");
    }

    await safeClick(page, "Create Token");

    await waitForCondition(
      () => !page.url().includes("/tokens/create"),
      { description: "navigation away from token create page", maxAttempts: 30 },
    );

    // First visit: cleartext token should be visible
    const tokenCode = page.locator("code");
    await tokenCode.waitFor({ state: "visible", timeout: 5000 });
    const tokenText = await tokenCode.textContent();
    expect(tokenText!.trim().length).toBeGreaterThan(10);

    // Warning message should be visible
    const warning = page.getByText("only be displayed once");
    await expect(warning).toBeVisible();

    // Copy button should exist
    const copyButton = page.locator('button[title="Copy to clipboard"]');
    await expect(copyButton).toBeVisible();

    // Save URL and reload (second visit)
    const tokenUrl = page.url();
    await page.goto(tokenUrl);

    // Second visit: cleartext should NOT be visible
    await expect(page.locator("code")).not.toBeVisible({ timeout: 5000 });

    // Should show "already been displayed" message
    const alreadyDisplayed = page.getByText("already been displayed");
    await expect(alreadyDisplayed).toBeVisible();
  });

  test("tokens list page loads", async ({ page }) => {
    await signupAndLogin(page);
    await loadUrl(page, "/tokens");
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});
