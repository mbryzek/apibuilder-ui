import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Test Configuration for API Builder UI
 *
 * This suite runs on a developer machine AND in CI (ISS-4028). `ci/e2e.sh` stands a throwaway
 * platform up per build — its own container, its own session database — which is the "platform
 * API it is allowed to create users in" that README.md says the suite needs. The
 * `process.env['CI']` branches below are what that run needs and a developer's does not.
 */

const FRONTEND_BASE_URL = process.env['FRONTEND_BASE_URL'] || 'http://localhost:5173';
const HEADLESS = process.env['HEADLESS'] === 'true';
const TEST_RUN_DIR = process.env['TEST_RUN_DIR'] || '/tmp/playwright-apibuilder-screenshots';

/**
 * The port CI told this build to serve the frontend on (`dev e2e run`, ISS-2193).
 *
 * ONLY SET IN CI, and the `webServer` below keys off that rather than off `CI`, so a developer's
 * workflow is untouched: you start `npm run dev` yourself, this stays undefined, and playwright
 * manages no server — exactly as before.
 *
 * `strictPort` IS THE LOAD-BEARING WORD. A runner executes several builds at once behind nothing
 * but a per-repo flock (ISS-2066), and vite silently auto-increments a taken port. Without
 * `--strictPort` the collision is not a bind error: this suite attaches to the NEIGHBOURING
 * build's dev server and reports on that repo's frontend against this one's backend, which is a
 * red (or worse, a green) that nothing in the log explains.
 */
const E2E_WEB_PORT = process.env['E2E_WEB_PORT'];

export default defineConfig({
  testDir: './playwright/tests',

  globalSetup: './playwright/global-setup.ts',

  outputDir: `${TEST_RUN_DIR}/test-results`,

  timeout: 60000,
  expect: {
    timeout: 30000
  },

  fullyParallel: true,

  // A stray `test.only` merged into `main` would silently reduce the CI suite to one spec.
  forbidOnly: !!process.env['CI'],

  // Retried in CI only, matching every other browser suite in this fleet. The `e2e` context does
  // not gate a merge, so a retry here buys a diagnosable report rather than a laundered green.
  retries: process.env['CI'] ? 2 : 0,

  // ONE worker in CI. The backend is an emulated amd64 JVM sharing a runner with other builds, so
  // 20 workers against it is not parallelism, it is a timeout — and every other suite in the
  // fleet already serializes for exactly that reason.
  workers: process.env['CI'] ? 1 : 20,

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
  ],
  ...(E2E_WEB_PORT
    ? {
        webServer: {
          // `npm run dev` rather than a build + preview: these specs were written against the dev
          // server a developer runs, and the point of enrolling them is to run THAT suite rather
          // than a differently-served approximation of it. VITE_API_BASE_URL reaches it from this
          // process's environment, where `dev e2e run` put it — vite gives a `VITE_`-prefixed
          // process variable precedence over the committed `.env`.
          command: `npm run dev -- --port ${E2E_WEB_PORT} --strictPort`,
          url: FRONTEND_BASE_URL,
          // NEVER reuse. A server already on this port is by definition not ours — the port was
          // allocated to this build seconds ago — so reusing it is the ISS-2066 collision wearing
          // a friendlier face.
          reuseExistingServer: false,
          timeout: 120_000,
          stdout: 'pipe',
          stderr: 'pipe'
        }
      }
    : {})
});
