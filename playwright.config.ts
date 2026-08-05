import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Test Configuration for API Builder UI
 *
 * This suite runs on a developer machine only — it needs a platform API it is allowed to create
 * users in, which nothing unattended can safely provide. There are therefore no
 * `process.env['CI']` branches here: a `forbidOnly`/`retries`/`workers` split by CI would read as
 * "CI runs this" and no CI runs this. See "Why the Playwright suite is a developer tool, not a
 * gate" in README.md.
 */

const FRONTEND_BASE_URL = process.env['FRONTEND_BASE_URL'] || 'http://localhost:5173';
const HEADLESS = process.env['HEADLESS'] === 'true';
const TEST_RUN_DIR = process.env['TEST_RUN_DIR'] || '/tmp/playwright-apibuilder-screenshots';

export default defineConfig({
  testDir: './playwright/tests',

  globalSetup: './playwright/global-setup.ts',

  outputDir: `${TEST_RUN_DIR}/test-results`,

  timeout: 60000,
  expect: {
    timeout: 30000
  },

  fullyParallel: true,

  workers: 20,

  reporter: [
    ['list'],
    ['html', { outputFolder: `${TEST_RUN_DIR}/html-report` }],
    ['json', { outputFile: `${TEST_RUN_DIR}/test-results.json` }]
  ],

  use: {
    baseURL: FRONTEND_BASE_URL,

    trace: 'on-first-retry',

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',

    navigationTimeout: 60000,

    actionTimeout: 30000
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          slowMo: HEADLESS ? 0 : 50
        }
      }
    }
  ]
});
