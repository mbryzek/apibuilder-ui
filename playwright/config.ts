/**
 * Playwright Test Configuration
 * Shared configuration for all API Builder UI tests
 */

import type { TestConfig } from './types';

export const config: TestConfig = {
  FRONTEND_BASE_URL: process.env['FRONTEND_BASE_URL'] || 'http://localhost:5173',

  API_BASE_URL: process.env['API_BASE_URL'] || 'http://localhost:9300',

  TENANT_ID: process.env['TENANT_ID'] || 'apibuilder',

  BROWSER_CONFIG: {
    headless: process.env['HEADLESS'] === 'true',
    slowMo: process.env['HEADLESS'] === 'true' ? 0 : 50,
    viewport: { width: 1920, height: 1080 }
  },

  TIMEOUTS: {
    default: 5000,
    navigation: 10000,
    action: 5000
  },

  SCREENSHOTS: {
    enabled: process.env['SCREENSHOTS'] === 'true',
    path: process.env['TEST_RUN_DIR']
      ? `${process.env['TEST_RUN_DIR']}/screenshots`
      : '/tmp/playwright-apibuilder-screenshots',
    fullPage: true
  }
};
