/**
 * The account menu (rules/frontend.account.menu.mdc): profile and log out live in one menu — the
 * last row of the sidebar where the page has one, the right end of the header otherwise, and the
 * bottom of the slide-out menu on a phone. Neither is ever an item in the nav or the header.
 */

import { test, expect, type Page } from '@playwright/test';
import { fillField, generateUUID, loadUrl, safeClick, signupAndLogin, waitForNavigationAway } from '../utils/test-helpers';

function accountButton(page: Page) {
  return page.locator('button[aria-label="Account menu"]:visible');
}

async function expectMenuOpensAndEscapeCloses(page: Page): Promise<void> {
  const button = accountButton(page);
  await expect(button).toHaveCount(1);
  await expect(button).toHaveAttribute('aria-haspopup', 'menu');
  await expect(button).toHaveAttribute('aria-expanded', 'false');

  await button.click();
  const menu = page.getByRole('menu', { name: 'Account' });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem')).toHaveText(['Your Profile', 'Log out']);
  await expect(menu.getByRole('menuitem', { name: 'Your Profile' })).toHaveAttribute('href', '/account/profile');
  await expect(button).toHaveAttribute('aria-expanded', 'true');

  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(button).toHaveAttribute('aria-expanded', 'false');
}

async function createOrg(page: Page): Promise<void> {
  await loadUrl(page, '/org/create');
  await fillField(page, 'input[name="name"]', `Menu Org ${generateUUID().slice(0, 8)}`);
  await fillField(page, 'input[name="namespace"]', `com.test.${generateUUID().slice(0, 8).replace(/-/g, '')}`);
  await safeClick(page, 'Create Organization');
  await waitForNavigationAway(page, '/org/create');
}

test.describe('Account menu', () => {
  test('sits at the right of the header on a page with no sidebar', async ({ page }) => {
    await signupAndLogin(page);
    await loadUrl(page, '/generators');

    // Nothing in the nav or header logs out except through the menu.
    await expect(page.locator('header form[action="/logout"]')).toHaveCount(0);
    await expect(page.locator('header').getByText(/log ?out/i)).toHaveCount(0);

    await expect(page.locator('header').locator(accountButton(page))).toHaveCount(1);
    await expectMenuOpensAndEscapeCloses(page);
  });

  test('closes on an outside click and on navigation', async ({ page }) => {
    await signupAndLogin(page);
    await loadUrl(page, '/generators');

    await accountButton(page).click();
    const menu = page.getByRole('menu', { name: 'Account' });
    await expect(menu).toBeVisible();
    await page.locator('main').click({ position: { x: 5, y: 5 } });
    await expect(menu).toHaveCount(0);

    await accountButton(page).click();
    await menu.getByRole('menuitem', { name: 'Your Profile' }).click();
    await page.waitForURL('**/account/profile');
    await expect(menu).toHaveCount(0);
  });

  test('is the last row of the sidebar on an organization page', async ({ page }) => {
    await signupAndLogin(page);
    await createOrg(page);

    await expect(page.locator('header').locator(accountButton(page))).toHaveCount(0);
    await expect(page.locator('nav').locator(accountButton(page))).toHaveCount(1);
    await expectMenuOpensAndEscapeCloses(page);
  });

  test('sits at the bottom of the slide-out menu on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signupAndLogin(page);
    await loadUrl(page, '/generators');

    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.locator('#mobile-menu').locator(accountButton(page))).toHaveCount(1);
    await expect(page.locator('#mobile-menu form[action="/logout"]')).toHaveCount(0);
    await expectMenuOpensAndEscapeCloses(page);
  });

  test('is absent when signed out, leaving a single Log in link', async ({ page }) => {
    await loadUrl(page, '/generators');
    await expect(page.locator('button[aria-label="Account menu"]')).toHaveCount(0);
    await expect(page.locator('header').getByRole('link', { name: 'Login' }).first()).toBeVisible();
  });
});
