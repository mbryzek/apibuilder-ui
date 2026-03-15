/**
 * Legacy API functions for endpoints not yet covered by generated clients.
 * These functions behave like generated clients: return parsed data on success,
 * throw ValidationErrorsResponse/UnauthorizedErrorsResponse/VoidResponse/ApiException on error.
 */

import { config } from '$lib/config';
import { ValidationErrorsResponse } from '$generated/generated-error-validation-errors-response';
import { UnauthorizedErrorsResponse } from '$generated/generated-error-unauthorized-errors-response';
import { VoidResponse } from '$generated/generated-error-void-response';
import { ApiException } from '$generated/generated-util';

type Headers = Record<string, string>;

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
	const url = new URL(`${config.apiBaseUrl}${path}`);
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined) {
				url.searchParams.set(key, String(value));
			}
		}
	}
	return url.toString();
}

/**
 * Process a raw fetch response like the generated clients do:
 * - 2xx with JSON body: return parsed data
 * - 204: return undefined
 * - 401: throw UnauthorizedErrorsResponse
 * - 404: throw VoidResponse
 * - 409/422: throw ValidationErrorsResponse
 * - other: throw ApiException
 */
async function processResponse<T>(response: globalThis.Response): Promise<T> {
	if (response.ok) {
		if (response.status === 204) {
			return undefined as T;
		}
		return await response.json() as T;
	}

	if (response.status === 401) {
		throw new UnauthorizedErrorsResponse(response);
	}

	if (response.status === 404) {
		throw new VoidResponse(response);
	}

	if (response.status === 409 || response.status === 422) {
		throw new ValidationErrorsResponse(response);
	}

	throw new ApiException(response, `Request failed with status ${response.status}`);
}

async function get<T>(path: string, headers: Headers, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
	const response = await fetch(buildUrl(path, params), {
		method: 'GET',
		headers: { 'Content-Type': 'application/json', ...headers },
	});
	return processResponse<T>(response);
}

async function post<T>(path: string, headers: Headers, body?: unknown): Promise<T> {
	const init: RequestInit = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...headers },
	};
	if (body !== undefined) {
		init.body = JSON.stringify(body);
	}
	const response = await fetch(buildUrl(path), init);
	return processResponse<T>(response);
}

async function postRaw<T>(path: string, headers: Headers, body: string): Promise<T> {
	const response = await fetch(buildUrl(path), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...headers },
		body,
	});
	return processResponse<T>(response);
}

async function put<T>(path: string, headers: Headers, body?: unknown): Promise<T> {
	const init: RequestInit = {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json', ...headers },
	};
	if (body !== undefined) {
		init.body = JSON.stringify(body);
	}
	const response = await fetch(buildUrl(path), init);
	return processResponse<T>(response);
}

async function del<T>(path: string, headers: Headers): Promise<T> {
	const response = await fetch(buildUrl(path), {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json', ...headers },
	});
	return processResponse<T>(response);
}

// === Users ===

export function getUsers(headers: Headers, params?: { guid?: string; email?: string; nickname?: string }): Promise<any[]> {
	return get('/users', headers, params);
}

export function getUserByGuid(guid: string, headers: Headers): Promise<any> {
	return get(`/users/${guid}`, headers);
}

export function updateUser(guid: string, form: { email: string; nickname: string; name?: string }, headers: Headers): Promise<any> {
	return put(`/users/${guid}`, headers, form);
}

// === Memberships ===

export function getMemberships(params: Record<string, string | number | boolean | undefined>, headers: Headers): Promise<any[]> {
	return get('/memberships', headers, params);
}

export function deleteMembership(guid: string, headers: Headers): Promise<void> {
	return del(`/memberships/${guid}`, headers);
}

// === Membership Requests ===

export function getMembershipRequests(headers: Headers, params?: { org_key?: string; user_guid?: string; limit?: number; offset?: number }): Promise<any[]> {
	return get('/membership_requests', headers, params);
}

export function createMembershipRequest(orgGuid: string, userGuid: string, role: string, headers: Headers): Promise<any> {
	return post('/membership_requests', headers, { org_guid: orgGuid, user_guid: userGuid, role });
}

export function acceptMembershipRequest(guid: string, headers: Headers): Promise<any> {
	return post(`/membership_requests/${guid}/accept`, headers);
}

export function declineMembershipRequest(guid: string, headers: Headers): Promise<void> {
	return post(`/membership_requests/${guid}/decline`, headers);
}

// === Applications ===

export function getApplications(orgKey: string, headers: Headers, params?: { name?: string; key?: string; has_version?: boolean; limit?: number; offset?: number; sort_by?: string; order?: string }): Promise<any[]> {
	return get(`/${orgKey}`, headers, params);
}

export function createApplication(orgKey: string, form: { name: string; key?: string; description?: string; visibility: string }, headers: Headers): Promise<any> {
	return post(`/${orgKey}`, headers, form);
}

export function updateApplication(orgKey: string, appKey: string, form: { name: string; key?: string; description?: string; visibility: string }, headers: Headers): Promise<any> {
	return put(`/${orgKey}/${appKey}`, headers, form);
}

export function deleteApplication(orgKey: string, appKey: string, headers: Headers): Promise<void> {
	return del(`/${orgKey}/${appKey}`, headers);
}

export function moveApplication(orgKey: string, appKey: string, form: { org_key: string }, headers: Headers): Promise<any> {
	return post(`/${orgKey}/${appKey}/move`, headers, form);
}

export function getApplicationVersions(orgKey: string, appKey: string, headers: Headers, params?: { limit?: number; offset?: number }): Promise<any[]> {
	return get(`/${orgKey}/metadata/${appKey}/versions`, headers, params);
}

// === Versions ===

export function getVersions(orgKey: string, appKey: string, headers: Headers, params?: { limit?: number; offset?: number }): Promise<any[]> {
	return get(`/${orgKey}/${appKey}`, headers, params);
}

export function getVersion(orgKey: string, appKey: string, version: string, headers: Headers): Promise<any> {
	return get(`/${orgKey}/${appKey}/${version}`, headers);
}

export function createVersion(orgKey: string, appKey: string, form: { original_form: { type?: string; data: string }; visibility?: string }, headers: Headers): Promise<any> {
	return post(`/${orgKey}/${appKey}`, headers, form);
}

export function deleteVersion(orgKey: string, appKey: string, version: string, headers: Headers): Promise<void> {
	return del(`/${orgKey}/${appKey}/${version}`, headers);
}

export function getExample(orgKey: string, appKey: string, version: string, typeName: string, headers: Headers, params?: { sub_type_name?: string; optional_fields?: boolean }): Promise<any> {
	return get(`/${orgKey}/${appKey}/${version}/example/${typeName}`, headers, params);
}

// === Code ===

export function getCode(orgKey: string, appKey: string, version: string, generatorKey: string, headers: Headers): Promise<any> {
	return get(`/${orgKey}/${appKey}/${version}/${generatorKey}`, headers);
}

export function postCode(orgKey: string, appKey: string, version: string, generatorKey: string, form: { attributes: { name: string; value: string }[] }, headers: Headers): Promise<any> {
	return post(`/${orgKey}/${appKey}/${version}/${generatorKey}`, headers, form);
}

// === Organization Attributes ===

export function getOrgAttributes(orgKey: string, headers: Headers, params?: { name?: string; limit?: number; offset?: number }): Promise<any[]> {
	return get(`/organizations/${orgKey}/attributes`, headers, params);
}

export function putOrgAttribute(orgKey: string, name: string, form: { value: string }, headers: Headers): Promise<any> {
	return put(`/organizations/${orgKey}/attributes/${name}`, headers, form);
}

export function deleteOrgAttribute(orgKey: string, name: string, headers: Headers): Promise<void> {
	return del(`/organizations/${orgKey}/attributes/${name}`, headers);
}

// === Organizations ===

export function getOrganizations(params: Record<string, string | number | boolean | undefined>, headers: Headers): Promise<any[]> {
	return get('/organizations', headers, params);
}

export function getOrganizationByKey(key: string, headers: Headers): Promise<any> {
	return get(`/organizations/${key}`, headers);
}

export function updateOrganization(key: string, form: { name: string; key?: string; namespace: string; visibility?: string; domains?: string[] }, headers: Headers): Promise<any> {
	return put(`/organizations/${key}`, headers, form);
}

export function createOrganization(form: { name: string; key?: string; namespace: string; visibility?: string; domains?: string[] }, headers: Headers): Promise<any> {
	return post('/organizations', headers, form);
}

export function deleteOrganization(key: string, headers: Headers): Promise<void> {
	return del(`/organizations/${key}`, headers);
}

// === Domains ===

export function createDomain(orgKey: string, domain: { name: string }, headers: Headers): Promise<any> {
	return post(`/domains/${orgKey}`, headers, domain);
}

export function deleteDomain(orgKey: string, name: string, headers: Headers): Promise<void> {
	return del(`/domains/${orgKey}/${name}`, headers);
}

// === Generators ===

export function getGenerators(headers: Headers, params?: { key?: string; service_guid?: string; limit?: number; offset?: number }): Promise<any[]> {
	return get('/generators', headers, params);
}

export function getGeneratorByKey(key: string, headers: Headers): Promise<any> {
	return get(`/generators/${key}`, headers);
}

// === Generator Services ===

export function getGeneratorServices(headers: Headers, params?: { guid?: string; uri?: string; generator_key?: string; limit?: number; offset?: number }): Promise<any[]> {
	return get('/generator_services', headers, params);
}

export function getGeneratorServiceByGuid(guid: string, headers: Headers): Promise<any> {
	return get(`/generator_services/${guid}`, headers);
}

export function createGeneratorService(form: { uri: string }, headers: Headers): Promise<any> {
	return post('/generator_services', headers, form);
}

export function deleteGeneratorService(guid: string, headers: Headers): Promise<void> {
	return del(`/generator_services/${guid}`, headers);
}

// === Subscriptions ===

export function getSubscriptions(headers: Headers, params?: { organization_key?: string; user_guid?: string; publication?: string; limit?: number; offset?: number }): Promise<any[]> {
	return get('/subscriptions', headers, params);
}

export function createSubscription(form: { organization_key: string; user_guid: string; publication: string }, headers: Headers): Promise<any> {
	return post('/subscriptions', headers, form);
}

export function deleteSubscription(guid: string, headers: Headers): Promise<void> {
	return del(`/subscriptions/${guid}`, headers);
}

// === Watches ===

export function getWatches(headers: Headers, params?: { user_guid?: string; organization_key?: string; application_key?: string; limit?: number; offset?: number }): Promise<any[]> {
	return get('/watches', headers, params);
}

export function createWatch(form: { user_guid: string; organization_key: string; application_key: string }, headers: Headers): Promise<any> {
	return post('/watches', headers, form);
}

export function deleteWatch(guid: string, headers: Headers): Promise<void> {
	return del(`/watches/${guid}`, headers);
}

// === Tokens ===

export function getTokens(userGuid: string, headers: Headers, params?: { limit?: number; offset?: number }): Promise<any[]> {
	return get(`/tokens/users/${userGuid}`, headers, params);
}

export function getCleartextToken(guid: string, headers: Headers): Promise<any> {
	return get(`/tokens/${guid}/cleartext`, headers);
}

export function createToken(form: { user_guid: string; description?: string }, headers: Headers): Promise<any> {
	return post('/tokens', headers, form);
}

export function deleteToken(guid: string, headers: Headers): Promise<void> {
	return del(`/tokens/${guid}`, headers);
}

// === Attributes ===

export function getAttributes(headers: Headers, params?: { name?: string; limit?: number; offset?: number }): Promise<any[]> {
	return get('/attributes', headers, params);
}

export function createAttribute(form: { name: string; description?: string }, headers: Headers): Promise<any> {
	return post('/attributes', headers, form);
}

export function deleteAttribute(name: string, headers: Headers): Promise<void> {
	return del(`/attributes/${name}`, headers);
}

// === Search ===

export function searchItems(headers: Headers, params?: { q?: string; org_key?: string; limit?: number; offset?: number }): Promise<any[]> {
	return get('/items', headers, params);
}

// === Changes ===

export function getChanges(headers: Headers, params?: { org_key?: string; application_key?: string; from_version?: string; to_version?: string; limit?: number; offset?: number }): Promise<any[]> {
	return get('/changes', headers, params);
}

// === Password Reset ===

export function requestPasswordReset(email: string): Promise<void> {
	return post('/password_reset_requests', {}, { email });
}

export function resetPassword(token: string, password: string): Promise<any> {
	return post('/password_resets', {}, { token, password });
}

// === Email Verification ===

export function confirmEmailVerification(form: { token: string }, headers: Headers): Promise<void> {
	return post('/email_verification_confirmations', headers, form);
}

// === Validation ===

export function validateSpec(data: string, headers: Headers): Promise<any> {
	return postRaw('/', headers, data);
}

// === GitHub Authentication ===

export function authenticateGithub(token: string): Promise<any> {
	return post('/users/authenticate_github', {}, { token });
}
