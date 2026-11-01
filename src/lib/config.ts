export const SESSION_COOKIE = 'session_id';

const environment = import.meta.env['VITE_ENVIRONMENT'] || 'development';

export const config = {
  apiBaseUrl: import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:9300',
  tenantId: import.meta.env['VITE_TENANT_ID'] || 'apibuilder',
  appBaseUrl: import.meta.env['VITE_APP_BASE_URL'] || 'http://localhost:5173',
  environment,
  isProduction: import.meta.env['VITE_ENVIRONMENT'] === 'production' || import.meta.env.PROD,

  /** The server half of PostHog (`#lib/server/posthog.ts`). An empty key leaves it off. */
  posthog: {
    apiKey: import.meta.env['VITE_POSTHOG_API_KEY'] || '',
    host: import.meta.env['VITE_POSTHOG_HOST'] || 'https://us.i.posthog.com',
    enabled: environment === 'production' || import.meta.env['VITE_POSTHOG_ENABLED'] === 'true'
  }
} as const;
