import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Test Configuration for API Builder UI
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
    timeout: 30000,
  },

  fullyParallel: true,

  forbidOnly: !!process.env['CI'],

  retries: process.env['CI'] ? 2 : 0,

  workers: process.env['CI'] ? 1 : 20,

  reporter: [
    ['list'],
    ['html', { outputFolder: `${TEST_RUN_DIR}/html-report` }],
    ['json', { outputFile: `${TEST_RUN_DIR}/test-results.json` }],
  ],

  use: {
    baseURL: FRONTEND_BASE_URL,

    trace: 'on-first-retry',

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',

    navigationTimeout: 60000,

    actionTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          slowMo: HEADLESS ? 0 : 50,
        },
      },
    },
  ],
});
