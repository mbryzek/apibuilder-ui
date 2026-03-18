/**
 * Navigation and Page Load Tests for API Builder UI
 * Tests that key pages load without errors
 */

import { test, expect } from "@playwright/test";
import {
  generateRandomEmail,
  createUserViaApi,
  setSessionCookie,
  loadUrl,
} from "../utils/test-helpers";

async function signupAndLogin(page: import("@playwright/test").Page): Promise<void> {
  const email = generateRandomEmail();
  const result = await createUserViaApi(email, "testpassword");
  await setSessionCookie(page, result.session.id);
}

test.describe("Public pages load", () => {
  test("home page", async ({ page }) => {
    await loadUrl(page, "/");
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test("login page", async ({ page }) => {
    await loadUrl(page, "/login");
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test("signup page", async ({ page }) => {
    await loadUrl(page, "/signup");
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test("generators page", async ({ page }) => {
    await loadUrl(page, "/generators");
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test("history page", async ({ page }) => {
    await loadUrl(page, "/history");
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test("search page", async ({ page }) => {
    await loadUrl(page, "/search?q=test");
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});

test.describe("Authenticated pages load", () => {
  test("org create page", async ({ page }) => {
    await signupAndLogin(page);
    await loadUrl(page, "/org/create");
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });

  test("tokens page", async ({ page }) => {
    await signupAndLogin(page);
    await loadUrl(page, "/tokens");
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test("tokens create page", async ({ page }) => {
    await signupAndLogin(page);
    await loadUrl(page, "/tokens/create");
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test("account profile page", async ({ page }) => {
    await signupAndLogin(page);
    await loadUrl(page, "/account/profile");
    const title = await page.title();
    expect(title).toBeTruthy();
  });

});

test.describe("Auth redirects", () => {
  test("tokens page redirects to login when not authenticated", async ({ page }) => {
    await loadUrl(page, "/tokens");
    expect(page.url()).toContain("/login");
  });

  test("org create redirects to login when not authenticated", async ({ page }) => {
    await loadUrl(page, "/org/create");
    expect(page.url()).toContain("/login");
  });

  test("account profile redirects to login when not authenticated", async ({ page }) => {
    await loadUrl(page, "/account/profile");
    expect(page.url()).toContain("/login");
  });
});
