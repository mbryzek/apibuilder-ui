/**
 * API Clients
 * Direct access to generated API clients
 */

import { ApiClient as ApiBuilderClient } from '#generated/com-bryzek-apibuilder.ts';
import { ApiClient as GeneratorClient } from '#generated/com-bryzek-apibuilder-generator.ts';
import { ApiClient as PlatformClient } from '#generated/com-bryzek-platform.ts';
import { sessionHeaders, type ApiClientOptions } from '#generated/generated-util.ts';
import { config } from '#lib/config.ts';

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

/** The headers that authenticate a call as the signed-in user, plus the bypass headers off production. */
export function getSessionHeaders(sessionId?: string): Record<string, string> {
  return sessionHeaders(sessionId, { isProduction: config.isProduction });
}
