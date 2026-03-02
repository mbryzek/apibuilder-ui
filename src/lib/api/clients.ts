import { ApiClient } from '$generated/io-apibuilder-api-v0';
import { config } from '$lib/config';

export { ApiClient };

export function apiClient(): ApiClient {
	return new ApiClient(config.apiBaseUrl);
}

export function getSessionHeaders(sessionId?: string): Record<string, string> {
	if (!sessionId) return {};
	return { Authorization: 'Session ' + sessionId };
}
