/**
 * Token Tests for API Builder UI
 */

import { test, expect } from '@playwright/test';
import { loadUrl, safeClick, signupAndLogin, waitForCondition } from '../utils/test-helpers';

test.describe('Tokens', () => {
  test('creates a token and shows its value on the create page', async ({ page, context }) => {
    await signupAndLogin(page);

    await loadUrl(page, '/tokens/create');

    // Fill optional description
    const descriptionInput = page.locator('input[name="description"], textarea[name="description"]');
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill('Test token from Playwright');
    }

    await safeClick(page, 'Create Token');

    // NO redirect: the value exists only in the mint response, so the page that made the request is
    // the only one that can render it.
    const tokenCode = page.locator('code');
    await tokenCode.waitFor({ state: 'visible', timeout: 5000 });
    expect(page.url()).toContain('/tokens/create');

    const tokenText = await tokenCode.textContent();
    expect(tokenText).toBeTruthy();
    expect(tokenText!.trim().length).toBeGreaterThan(10);

    // Grant clipboard permissions and copy token
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await tokenCode.click();

    // Verify the token text is selectable (has select-all class)
    const selectAllClass = await tokenCode.getAttribute('class');
    expect(selectAllClass).toContain('select-all');
  });

  test('the value is never shown again, and the detail page shows the mask instead', async ({ page }) => {
    await signupAndLogin(page);

    await loadUrl(page, '/tokens/create');

    const descriptionInput = page.locator('input[name="description"], textarea[name="description"]');
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill('Single view test');
    }

    await safeClick(page, 'Create Token');

    const tokenCode = page.locator('code');
    await tokenCode.waitFor({ state: 'visible', timeout: 5000 });
    const cleartext = (await tokenCode.textContent())!.trim();
    expect(cleartext.length).toBeGreaterThan(10);

    await expect(page.getByText('only time this token is shown')).toBeVisible();
    await expect(page.locator('button[title="Copy to clipboard"]')).toBeVisible();

    // The detail page carries the mask and nothing that authenticates.
    await safeClick(page, 'View token details');
    await waitForCondition(() => !page.url().includes('/tokens/create'), {
      description: 'navigation to the token detail page',
      maxAttempts: 30
    });
    expect(page.url()).toMatch(/\/tokens\/[^/]+$/);
    await expect(page.getByText(cleartext)).toHaveCount(0);

    // Reloading it changes nothing — there is no one-time state left to spend.
    await page.reload();
    await expect(page.getByText(cleartext)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Delete Token' })).toBeVisible();
  });

  test('tokens list page loads', async ({ page }) => {
    await signupAndLogin(page);
    await loadUrl(page, '/tokens');
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});
