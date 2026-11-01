/**
 * The application's configuration as a function of the environment it is built with. Pure, so
 * that the build itself can read it too: `vite.config.ts` calls it before a `vite build`, which
 * is what turns a missing variable into a failed build rather than a deployed Worker calling
 * localhost. `config.ts` applies it to `import.meta.env`, which is what everything in the app
 * reads.
 *
 * A localhost default lives here and never in the committed `.env`: a production build reads that
 * file too, so a value there would stand in for a key `.env.production` lost. ISS-37645
 */

/** What Vite inlines out of `.env` / `.env.production`, plus its own `PROD`. */
export type BuildEnv = Readonly<Record<string, string | boolean | undefined>>;

function text(env: BuildEnv, name: string): string | undefined {
  const value = env[name];
  return typeof value === 'string' && value !== '' ? value : undefined;
}

/** A default for a development server and a test run; a production build throws instead. */
function developmentOnly(env: BuildEnv, name: string, developmentDefault: string): string {
  if (env['PROD'] === true) {
    throw new Error(
      `${name} is not set for this production build (expected in .env.production or the build environment); refusing to fall back to ${developmentDefault}`
    );
  }
  return developmentDefault;
}

function required(env: BuildEnv, name: string, developmentDefault: string): string {
  return text(env, name) ?? developmentOnly(env, name, developmentDefault);
}

export function configFrom(env: BuildEnv) {
  const environment = text(env, 'VITE_ENVIRONMENT');
  return {
    apiBaseUrl: required(env, 'VITE_API_BASE_URL', 'http://localhost:9300'),
    tenantId: text(env, 'VITE_TENANT_ID') ?? 'apibuilder',
    appBaseUrl: required(env, 'VITE_APP_BASE_URL', 'http://localhost:5173'),
    environment: environment ?? 'development',
    isProduction: environment === 'production' || env['PROD'] === true,

    /** The server half of PostHog (`#lib/server/posthog.ts`). An empty key leaves it off. */
    posthog: {
      apiKey: text(env, 'VITE_POSTHOG_API_KEY') ?? '',
      host: text(env, 'VITE_POSTHOG_HOST') ?? 'https://us.i.posthog.com',
      enabled: environment === 'production' || env['VITE_POSTHOG_ENABLED'] === 'true'
    }
  } as const;
}
