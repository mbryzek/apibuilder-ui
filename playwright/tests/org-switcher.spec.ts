/**
 * The organization switcher: a member of one organization sees its name and no menu, and a member
 * of two moves between them from the header, the menu listing only the other one.
 */

import { test, expect, type Page } from '@playwright/test';
import { fillField, generateUUID, loadUrl, safeClick, signupAndLogin, waitForNavigationAway } from '../utils/test-helpers';

function switcher(page: Page) {
  return page.locator('header button[aria-label="Switch organization"]:visible');
}

function orgLink(page: Page) {
  return page.locator('header a[aria-label^="Organization "]:visible');
}

/** The switcher's label: the first 12 characters of the name, then ... when cut. */
function shortName(name: string): string {
  return name.length > 12 ? `${name.slice(0, 12)}...` : name;
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

async function createOrg(page: Page): Promise<string> {
  await loadUrl(page, '/org/create');
  return submitCreateForm(page);
}

test.describe('Organization switcher', () => {
  test('a member of one organization sees its name and no menu, and a second org adds the menu', async ({ page }) => {
    await signupAndLogin(page);
    const first = await createOrg(page);

    // The home page lists the one organization rather than redirecting into it.
    await loadUrl(page, '/');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: 'My Organizations' })).toBeVisible();
    await expect(page.locator('main').getByRole('link', { name: 'Create Organization' })).toBeVisible();
    await expect(page.locator('main').getByText(first)).toBeVisible();
    await expect(orgLink(page)).toHaveText(shortName(first));
    await expect(switcher(page)).toHaveCount(0);

    const second = await createOrg(page);
    await expect(switcher(page)).toHaveText(shortName(second));

    await switcher(page).click();
    const items = switcherMenu(page).getByRole('menuitem');
    await expect(items).toHaveCount(1);
    await expect(items).toHaveText(first);
  });

  test('a member of two organizations switches between them', async ({ page }) => {
    await signupAndLogin(page);
    const first = await createOrg(page);
    const second = await createOrg(page);
    await expect(switcher(page)).toHaveText(shortName(second));

    await switcher(page).click();
    await switcherMenu(page).getByRole('menuitem', { name: first }).click();
    await expect(switcher(page)).toHaveText(shortName(first));
    await expect(switcherMenu(page)).toHaveCount(0);

    await switcher(page).click();
    await expect(switcherMenu(page).getByRole('menuitem')).toHaveText([second]);
    await switcherMenu(page).getByRole('menuitem', { name: second }).click();
    await expect(switcher(page)).toHaveText(shortName(second));
  });

  test('is absent when signed out', async ({ page }) => {
    await loadUrl(page, '/generators');
    await expect(page.locator('button[aria-label="Switch organization"]')).toHaveCount(0);
  });
});
