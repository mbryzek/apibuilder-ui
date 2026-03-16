/**
 * API Clients
 * Direct access to generated API clients
 */

import { ApiClient as ApiBuilderClient } from "$generated/com-bryzek-bryzek-apibuilder-v0";
import { ApiClient as GeneratorClient } from "$generated/com-bryzek-bryzek-apibuilder-generator-v0";
import { ApiClient as PlatformClient } from "$generated/com-bryzek-platform-v0";
import { config } from "$lib/config";

export { ApiBuilderClient, GeneratorClient, PlatformClient };

export function clients() {
	return {
		apibuilder: apiBuilderClient(),
		platform: platformClient(),
	};
}

export function apiBuilderClient(): ApiBuilderClient {
	return new ApiBuilderClient(config.apiBaseUrl);
}

export function generatorClient(): GeneratorClient {
	return new GeneratorClient(config.apiBaseUrl);
}

export function platformClient(): PlatformClient {
	return new PlatformClient(config.apiBaseUrl);
}

function getRateLimitBypassHeaders(): Record<string, string> {
	if (!config.isProduction) {
		return { "X-Bypass-Rate-Limit": "true" };
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
		session_id: sessionId,
	};
}
