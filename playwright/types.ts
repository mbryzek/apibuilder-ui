/**
 * TypeScript Type Definitions for API Builder UI Tests
 */

import type { BrowserContext, Page } from "@playwright/test";

/**
 * Browser configuration options
 */
export interface BrowserConfig {
  headless: boolean;
  slowMo: number;
  viewport: {
    width: number;
    height: number;
  };
}

/**
 * Timeout configuration
 */
export interface TimeoutConfig {
  default: number;
  navigation: number;
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
  BROWSER_CONFIG: BrowserConfig;
  TIMEOUTS: TimeoutConfig;
  SCREENSHOTS: ScreenshotConfig;
}

/**
 * Context that can be either BrowserContext or Page
 */
export type ContextOrPage = BrowserContext | Page;
