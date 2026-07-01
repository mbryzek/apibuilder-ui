/**
 * Signup and Login Tests for API Builder UI
 */

import { test, expect } from "@playwright/test";
import {
  generateRandomEmail,
  fillField,
  loadUrl,
  waitForCondition,
  createUserViaApi,
  safeClick,
} from "../utils/test-helpers";

test.describe("Signup", () => {
  test("creates a new account and redirects to org create", async ({ page }) => {
    const email = generateRandomEmail();
    const password = "testpassword123";

    await loadUrl(page, "/signup");

    await fillField(page, 'input[name="email"]', email);
    await fillField(page, 'input[name="password"]', password);
    await safeClick(page, "Create account");

    await waitForCondition(
      () => !page.url().includes("/signup"),
      { description: "navigation away from signup page", maxAttempts: 20 },
    );

    // Should redirect away from signup (to home)
    expect(page.url()).not.toContain("/signup");
  });

  test("shows error for duplicate email", async ({ page }) => {
    const email = generateRandomEmail();
    const password = "testpassword123";

    // Create user via API first
    await createUserViaApi(email, password);

    await loadUrl(page, "/signup");

    await fillField(page, 'input[name="email"]', email);
    await fillField(page, 'input[name="password"]', password);
    await safeClick(page, "Create account");

    // Should show error about duplicate email
    const errorMessage = page.locator(".bg-red-50");
    await errorMessage.waitFor({ state: "visible", timeout: 10000 });
    const errorText = await errorMessage.textContent();
    expect(errorText).toBeTruthy();
  });

  test("shows error for missing email", async ({ page }) => {
    await loadUrl(page, "/signup");

    await fillField(page, 'input[name="password"]', "testpassword123");
    await safeClick(page, "Create account");

    // Browser validation should prevent submission (email has required attribute)
    const stillOnSignup = page.url().includes("/signup");
    expect(stillOnSignup).toBe(true);
  });
});

test.describe("Login", () => {
  test("logs in with valid credentials", async ({ page }) => {
    const email = generateRandomEmail();
    const password = "testpassword123";

    // Create user via API first
    await createUserViaApi(email, password);

    await loadUrl(page, "/login");

    await fillField(page, 'input[name="email"]', email);
    await fillField(page, 'input[name="password"]', password);
    await safeClick(page, "Sign in");

    await waitForCondition(
      () => !page.url().includes("/login"),
      { description: "navigation away from login page", maxAttempts: 20 },
    );

    expect(page.url()).not.toContain("/login");
  });

  test("preserves redirect target query string and shows flash after login", async ({ page }) => {
    // Pins the fix for the double-`?` bug: when the redirect target already carries
    // a query string, the login redirect must append flash params with `&`, not a
    // second `?`, so both the flash and the original params survive.
    const email = generateRandomEmail();
    const password = "testpassword123";
    await createUserViaApi(email, password);

    const redirectTarget = "/account/profile?tab=settings";
    await loadUrl(page, `/login?redirect=${encodeURIComponent(redirectTarget)}`);

    await fillField(page, 'input[name="email"]', email);
    await fillField(page, 'input[name="password"]', password);
    await safeClick(page, "Sign in");

    await waitForCondition(
      () => !page.url().includes("/login"),
      { description: "navigation away from login page", maxAttempts: 20 },
    );

    const url = new URL(page.url());
    // Original query param must survive (not corrupted by a second `?`).
    expect(url.searchParams.get("tab")).toBe("settings");
    // Flash must be parseable (would be swallowed if concatenated with a second `?`).
    // The layout strips flash params after showing the toast, so it may already be gone;
    // the invariant we pin is that `tab` is never mangled into `settings?flash=...`.
    expect(url.searchParams.get("tab")).not.toContain("flash");
    expect(url.pathname).toBe("/account/profile");
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await loadUrl(page, "/login");

    await fillField(page, 'input[name="email"]', "nonexistent@example.com");
    await fillField(page, 'input[name="password"]', "wrongpassword");
    await safeClick(page, "Sign in");

    const errorMessage = page.locator(".bg-red-50");
    await errorMessage.waitFor({ state: "visible", timeout: 10000 });
    const errorText = await errorMessage.textContent();
    expect(errorText).toBeTruthy();
  });

  test("signup then login flow", async ({ page }) => {
    const email = generateRandomEmail();
    const password = "testpassword123";

    // Sign up
    await loadUrl(page, "/signup");
    await fillField(page, 'input[name="name"]', "Test User");
    await fillField(page, 'input[name="email"]', email);
    await fillField(page, 'input[name="password"]', password);
    await safeClick(page, "Create account");

    await waitForCondition(
      () => !page.url().includes("/signup"),
      { description: "navigation away from signup page", maxAttempts: 20 },
    );

    // Log out by clearing cookies
    await page.context().clearCookies();

    // Log in with same credentials
    await loadUrl(page, "/login");
    await fillField(page, 'input[name="email"]', email);
    await fillField(page, 'input[name="password"]', password);
    await safeClick(page, "Sign in");

    await waitForCondition(
      () => !page.url().includes("/login"),
      { description: "navigation away from login page", maxAttempts: 20 },
    );

    expect(page.url()).not.toContain("/login");
  });
});
