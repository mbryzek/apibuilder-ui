/**
 * TypeScript Type Definitions for API Builder UI Tests
 */

import type { BrowserContext, Page } from '@playwright/test';

/**
 * Timeout configuration
 */
export interface TimeoutConfig {
  /** How long a helper waits for one interaction to take effect. */
  action: number;
}

/**
 * Screenshot settings
 */
export interface ScreenshotConfig {
  enabled: boolean;
  path: string;
  fullPage: boolean;
}

/**
 * Main test configuration object
 */
export interface TestConfig {
  FRONTEND_BASE_URL: string;
  API_BASE_URL: string;
  TENANT_ID: string;
  TIMEOUTS: TimeoutConfig;
  SCREENSHOTS: ScreenshotConfig;
}

/**
 * Context that can be either BrowserContext or Page
 */
export type ContextOrPage = BrowserContext | Page;
