import { ApiClient } from '$generated/io-apibuilder-api-v0';
import type { VersionForm } from '$generated/types';
import type { Version } from '$generated/types';
import { config } from '$lib/config';

export { ApiClient };

export function apiClient(): ApiClient {
	return new ApiClient(config.apiBaseUrl);
}

export function getSessionHeaders(sessionId?: string): Record<string, string> {
	if (!sessionId) return {};
	return { Authorization: 'Session ' + sessionId };
}

/**
 * Creates a new version by uploading a spec. The generated client requires a
 * `version` parameter in the URL, but the API derives the version from the
 * uploaded spec, so we pass an empty string as a placeholder.
 */
export function createVersion(
	client: ApiClient,
	params: { orgKey: string; applicationKey: string; body: VersionForm; headers?: Record<string, string> },
): Promise<Version> {
	return client.createVersionByVersion({ ...params, version: '' });
}
