/**
 * API Clients
 * Direct access to generated API clients
 */

import { ApiClient as ApiBuilderClient } from '$generated/com-bryzek-apibuilder';
import { ApiClient as GeneratorClient } from '$generated/com-bryzek-apibuilder-generator';
import { ApiClient as PlatformClient } from '$generated/com-bryzek-platform';
import type { ApiClientOptions } from '$generated/generated-util';
import { config } from '$lib/config';

export { ApiBuilderClient, GeneratorClient, PlatformClient };

/**
 * Everything a caller may vary per client: headers merged into every call, a request
 * timeout that ABORTS rather than abandons, and a fetch implementation (SvelteKit's
 * per-request `fetch`, a test double). The base url is this app's config, never the
 * caller's.
 */
export type ClientOptions = Omit<ApiClientOptions, 'baseUrl'>;

function clientOptions(options?: ClientOptions): ApiClientOptions {
  return { baseUrl: config.apiBaseUrl, ...options };
}

export function clients(options?: ClientOptions) {
  return {
    apibuilder: apiBuilderClient(options),
    platform: platformClient(options)
  };
}

export function apiBuilderClient(options?: ClientOptions): ApiBuilderClient {
  return new ApiBuilderClient(clientOptions(options));
}

export function generatorClient(options?: ClientOptions): GeneratorClient {
  return new GeneratorClient(clientOptions(options));
}

export function platformClient(options?: ClientOptions): PlatformClient {
  return new PlatformClient(clientOptions(options));
}

function getRateLimitBypassHeaders(): Record<string, string> {
  if (!config.isProduction) {
    return { 'X-Bypass-Rate-Limit': 'true' };
  }
  return {};
}

export function getSessionHeaders(sessionId?: string): Record<string, string> {
  const baseHeaders = getRateLimitBypassHeaders();
  if (!sessionId) {
    return baseHeaders;
  }
  return {
    ...baseHeaders,
    session_id: sessionId
  };
}
