/**
 * Domain Tests for API Builder UI
 */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  generateRandomEmail,
  generateUUID,
  fillField,
  loadUrl,
  waitForCondition,
  createUserViaApi,
  setSessionCookie,
  safeClick,
} from "../utils/test-helpers";

async function createOrgAndLogin(page: Page): Promise<string> {
  const email = generateRandomEmail();
  const result = await createUserViaApi(email, "testpassword");
  await setSessionCookie(page, result.session.id);

  await loadUrl(page, "/org/create");

  const orgName = `Test Org ${generateUUID().slice(0, 8)}`;
  const namespace = `com.test.${generateUUID().slice(0, 8).replace(/-/g, "")}`;

  await fillField(page, 'input[name="name"]', orgName);
  await fillField(page, 'input[name="namespace"]', namespace);
  await safeClick(page, "Create Organization");

  await waitForCondition(
    () => !page.url().includes("/org/create"),
    { description: "navigation away from org create page", maxAttempts: 30 },
  );

  const url = new URL(page.url());
  const orgKey = url.pathname.split("/").filter(Boolean)[0]!;
  return orgKey;
}

async function addDomainAndWait(page: Page, domainName: string): Promise<void> {
  await fillField(page, 'input[name="name"]', domainName);
  await safeClick(page, "Add Domain");

  await waitForCondition(
    async () => await page.getByText(domainName).isVisible().catch(() => false),
    { description: "domain to appear in list", maxAttempts: 30 },
  );
}

test.describe("Domains", () => {
  test("adds a domain and shows it in the list", async ({ page }) => {
    const orgKey = await createOrgAndLogin(page);

    await loadUrl(page, `/${orgKey}/domains`);

    await expect(page.getByText("No domains registered")).toBeVisible();

    const domainName = `test-${generateUUID().slice(0, 8)}.example.com`;
    await addDomainAndWait(page, domainName);

    await expect(page.getByText(domainName)).toBeVisible();
    await expect(page.getByText("No domains registered")).not.toBeVisible();
  });

  test("domain persists after page reload", async ({ page }) => {
    const orgKey = await createOrgAndLogin(page);

    await loadUrl(page, `/${orgKey}/domains`);

    const domainName = `test-${generateUUID().slice(0, 8)}.example.com`;
    await addDomainAndWait(page, domainName);

    await page.reload();
    await expect(page.getByText(domainName)).toBeVisible();
  });

  test("removes a domain after adding it", async ({ page }) => {
    const orgKey = await createOrgAndLogin(page);

    await loadUrl(page, `/${orgKey}/domains`);

    const domainName = `test-${generateUUID().slice(0, 8)}.example.com`;
    await addDomainAndWait(page, domainName);

    await safeClick(page, "Remove");
    await safeClick(page, "Confirm");

    await waitForCondition(
      async () => !(await page.getByText(domainName).isVisible().catch(() => false)),
      { description: "domain to be removed from list", maxAttempts: 30 },
    );

    await expect(page.getByText("No domains registered")).toBeVisible();
  });

  test("shows validation error for duplicate domain", async ({ page }) => {
    const orgKey = await createOrgAndLogin(page);

    await loadUrl(page, `/${orgKey}/domains`);

    const domainName = `test-${generateUUID().slice(0, 8)}.example.com`;
    await addDomainAndWait(page, domainName);

    await fillField(page, 'input[name="name"]', domainName);
    await safeClick(page, "Add Domain");

    await waitForCondition(
      async () => await page.getByText("already exists").isVisible().catch(() => false),
      { description: "error message to appear", maxAttempts: 30 },
    );
  });
});
