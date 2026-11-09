/**
 * The organization switcher: a member of one organization reaches Create organization from the UI
 * and lands on the new organization, and a member of two moves between them from the header.
 */

import { test, expect, type Page } from '@playwright/test';
import { fillField, generateUUID, loadUrl, safeClick, signupAndLogin, waitForNavigationAway } from '../utils/test-helpers';

function switcher(page: Page) {
  return page.locator('header button[aria-label="Switch organization"]:visible');
}

function switcherMenu(page: Page) {
  return page.getByRole('menu', { name: 'Organizations' });
}

/** Fills and submits /org/create, wherever the caller reached it from, and returns the new organization's name. */
async function submitCreateForm(page: Page): Promise<string> {
  const name = `Switch Org ${generateUUID().slice(0, 8)}`;
  await fillField(page, 'input[name="name"]', name);
  await fillField(page, 'input[name="namespace"]', `com.test.${generateUUID().slice(0, 8).replace(/-/g, '')}`);
  await safeClick(page, 'Create Organization');
  await waitForNavigationAway(page, '/org/create');
  return name;
}

async function createOrgThroughSwitcher(page: Page): Promise<string> {
  await switcher(page).click();
  await switcherMenu(page).getByRole('menuitem', { name: 'Create organization' }).click();
  await page.waitForURL('**/org/create');
  await page.locator('body[data-hydrated="true"]').waitFor({ state: 'attached' });
  return submitCreateForm(page);
}

test.describe('Organization switcher', () => {
  test('a member of one organization creates a second from the switcher and lands on it', async ({ page }) => {
    await signupAndLogin(page);
    await loadUrl(page, '/org/create');
    const first = await submitCreateForm(page);

    // The home page lists the one organization rather than redirecting into it.
    await loadUrl(page, '/');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: 'My Organizations' })).toBeVisible();
    await expect(page.locator('main').getByRole('link', { name: 'Create Organization' })).toBeVisible();
    await expect(page.locator('main').getByText(first)).toBeVisible();

    const second = await createOrgThroughSwitcher(page);
    await expect(switcher(page)).toHaveText(second);

    await switcher(page).click();
    const items = switcherMenu(page).getByRole('menuitem');
    await expect(items).toHaveCount(3);
    await expect(switcherMenu(page).locator('[aria-current="page"]')).toHaveText(second);
  });

  test('a member of two organizations switches between them', async ({ page }) => {
    await signupAndLogin(page);
    await loadUrl(page, '/org/create');
    const first = await submitCreateForm(page);
    const second = await createOrgThroughSwitcher(page);
    await expect(switcher(page)).toHaveText(second);

    await switcher(page).click();
    await switcherMenu(page).getByRole('menuitem', { name: first }).click();
    await expect(switcher(page)).toHaveText(first);
    await expect(switcherMenu(page)).toHaveCount(0);

    await switcher(page).click();
    await expect(switcherMenu(page).locator('[aria-current="page"]')).toHaveText(first);
    await switcherMenu(page).getByRole('menuitem', { name: second }).click();
    await expect(switcher(page)).toHaveText(second);
  });

  test('is absent when signed out', async ({ page }) => {
    await loadUrl(page, '/generators');
    await expect(page.locator('button[aria-label="Switch organization"]')).toHaveCount(0);
  });
});
