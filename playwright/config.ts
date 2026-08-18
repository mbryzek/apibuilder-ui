/**
 * Playwright Test Configuration
 * Shared configuration for all API Builder UI tests
 */

import type { TestConfig } from './types';

export const config: TestConfig = {
  FRONTEND_BASE_URL: process.env['FRONTEND_BASE_URL'] || 'http://localhost:5173',

  // BACKEND_BASE_URL FIRST, because that is the name `dev e2e run` hands a CI build
  // (devops/lib/e2e.rb names it as the contract with the frontend repos, and a suite that misses
  // it falls back to :9300 — where, on a runner, there is nothing at all). API_BASE_URL stays as
  // the local override it has always been.
  API_BASE_URL: process.env['BACKEND_BASE_URL'] || process.env['API_BASE_URL'] || 'http://localhost:9300',

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
    path: process.env['TEST_RUN_DIR'] ? `${process.env['TEST_RUN_DIR']}/screenshots` : '/tmp/playwright-apibuilder-screenshots',
    fullPage: true
  }
};
