/**
 * Generator Tests for API Builder UI
 */

import { test, expect } from "@playwright/test";
import { loadUrl } from "../utils/test-helpers";

test.describe("Generators", () => {
  test("generators page loads", async ({ page }) => {
    await loadUrl(page, "/generators");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
