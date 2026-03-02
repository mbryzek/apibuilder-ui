import { config } from '$lib/config';

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

async function get(path: string, headers: Headers, params?: Record<string, string | number | boolean | undefined>): Promise<globalThis.Response> {
	return fetch(buildUrl(path, params), { method: 'GET', headers: { 'Content-Type': 'application/json', ...headers } });
}

async function post(path: string, headers: Headers, body?: unknown): Promise<globalThis.Response> {
	const init: RequestInit = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...headers },
	};
	if (body !== undefined) {
		init.body = JSON.stringify(body);
	}
	return fetch(buildUrl(path), init);
}

async function postRaw(path: string, headers: Headers, body: string): Promise<globalThis.Response> {
	return fetch(buildUrl(path), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...headers },
		body,
	});
}

async function put(path: string, headers: Headers, body?: unknown): Promise<globalThis.Response> {
	const init: RequestInit = {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json', ...headers },
	};
	if (body !== undefined) {
		init.body = JSON.stringify(body);
	}
	return fetch(buildUrl(path), init);
}

async function del(path: string, headers: Headers): Promise<globalThis.Response> {
	return fetch(buildUrl(path), { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...headers } });
}

export function getSessionHeaders(sessionId?: string): Headers {
	if (!sessionId) {
		return {};
	}
	return { Authorization: 'Session ' + sessionId };
}

// === Authentication ===

export function getSessionById(sessionId: string, headers: Headers): Promise<globalThis.Response> {
	return get(`/authentications/session/${sessionId}`, headers);
}

export function authenticateEmail(email: string, password: string): Promise<globalThis.Response> {
	return post('/users/authenticate', {}, { email, password });
}

export function authenticateGithub(token: string): Promise<globalThis.Response> {
	return post('/users/authenticate_github', {}, { token });
}

export async function exchangeGithubCode(code: string, githubClientSecret: string): Promise<string> {
	const response = await fetch('https://github.com/login/oauth/access_token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		body: JSON.stringify({
			client_id: config.githubClientId,
			client_secret: githubClientSecret,
			code,
		}),
	});
	const data = await response.json();
	if (data.error) {
		throw new Error(data.error_description || data.error);
	}
	return data.access_token;
}

// === Users ===

export function getUsers(headers: Headers, params?: { guid?: string; email?: string; nickname?: string }): Promise<globalThis.Response> {
	return get('/users', headers, params);
}

export function getUserByGuid(guid: string, headers: Headers): Promise<globalThis.Response> {
	return get(`/users/${guid}`, headers);
}

export function updateUser(guid: string, form: { email: string; nickname: string; name?: string }, headers: Headers): Promise<globalThis.Response> {
	return put(`/users/${guid}`, headers, form);
}

// === Organizations ===

export function getOrganizations(params: Record<string, string | number | boolean | undefined>, headers: Headers): Promise<globalThis.Response> {
	return get('/organizations', headers, params);
}

export function getOrganizationByKey(key: string, headers: Headers): Promise<globalThis.Response> {
	return get(`/organizations/${key}`, headers);
}

export function createOrganization(form: {
	name: string;
	key?: string;
	namespace: string;
	visibility?: string;
	domains?: string[];
}, headers: Headers): Promise<globalThis.Response> {
	return post('/organizations', headers, form);
}

export function updateOrganization(key: string, form: {
	name: string;
	key?: string;
	namespace: string;
	visibility?: string;
	domains?: string[];
}, headers: Headers): Promise<globalThis.Response> {
	return put(`/organizations/${key}`, headers, form);
}

export function deleteOrganization(key: string, headers: Headers): Promise<globalThis.Response> {
	return del(`/organizations/${key}`, headers);
}

// === Organization Attributes ===

export function getOrgAttributes(orgKey: string, headers: Headers, params?: { name?: string; limit?: number; offset?: number }): Promise<globalThis.Response> {
	return get(`/organizations/${orgKey}/attributes`, headers, params);
}

export function putOrgAttribute(orgKey: string, name: string, form: { value: string }, headers: Headers): Promise<globalThis.Response> {
	return put(`/organizations/${orgKey}/attributes/${name}`, headers, form);
}

export function deleteOrgAttribute(orgKey: string, name: string, headers: Headers): Promise<globalThis.Response> {
	return del(`/organizations/${orgKey}/attributes/${name}`, headers);
}

// === Domains ===

export function createDomain(orgKey: string, domain: { name: string }, headers: Headers): Promise<globalThis.Response> {
	return post(`/domains/${orgKey}`, headers, domain);
}

export function deleteDomain(orgKey: string, name: string, headers: Headers): Promise<globalThis.Response> {
	return del(`/domains/${orgKey}/${name}`, headers);
}

// === Memberships ===

export function getMemberships(params: Record<string, string | number | boolean | undefined>, headers: Headers): Promise<globalThis.Response> {
	return get('/memberships', headers, params);
}

export function deleteMembership(guid: string, headers: Headers): Promise<globalThis.Response> {
	return del(`/memberships/${guid}`, headers);
}

// === Membership Requests ===

export function getMembershipRequests(headers: Headers, params?: { org_key?: string; user_guid?: string; limit?: number; offset?: number }): Promise<globalThis.Response> {
	return get('/membership_requests', headers, params);
}

export function createMembershipRequest(orgGuid: string, userGuid: string, role: string, headers: Headers): Promise<globalThis.Response> {
	return post('/membership_requests', headers, { org_guid: orgGuid, user_guid: userGuid, role });
}

export function acceptMembershipRequest(guid: string, headers: Headers): Promise<globalThis.Response> {
	return post(`/membership_requests/${guid}/accept`, headers);
}

export function declineMembershipRequest(guid: string, headers: Headers): Promise<globalThis.Response> {
	return post(`/membership_requests/${guid}/decline`, headers);
}

// === Applications ===

export function getApplications(orgKey: string, headers: Headers, params?: { name?: string; key?: string; has_version?: boolean; limit?: number; offset?: number; sort_by?: string; order?: string }): Promise<globalThis.Response> {
	return get(`/${orgKey}`, headers, params);
}

export function createApplication(orgKey: string, form: { name: string; key?: string; description?: string; visibility: string }, headers: Headers): Promise<globalThis.Response> {
	return post(`/${orgKey}`, headers, form);
}

export function updateApplication(orgKey: string, appKey: string, form: { name: string; key?: string; description?: string; visibility: string }, headers: Headers): Promise<globalThis.Response> {
	return put(`/${orgKey}/${appKey}`, headers, form);
}

export function deleteApplication(orgKey: string, appKey: string, headers: Headers): Promise<globalThis.Response> {
	return del(`/${orgKey}/${appKey}`, headers);
}

export function moveApplication(orgKey: string, appKey: string, form: { org_key: string }, headers: Headers): Promise<globalThis.Response> {
	return post(`/${orgKey}/${appKey}/move`, headers, form);
}

export function getApplicationVersions(orgKey: string, appKey: string, headers: Headers, params?: { limit?: number; offset?: number }): Promise<globalThis.Response> {
	return get(`/${orgKey}/metadata/${appKey}/versions`, headers, params);
}

// === Versions ===

export function getVersions(orgKey: string, appKey: string, headers: Headers, params?: { limit?: number; offset?: number }): Promise<globalThis.Response> {
	return get(`/${orgKey}/${appKey}`, headers, params);
}

export function getVersion(orgKey: string, appKey: string, version: string, headers: Headers): Promise<globalThis.Response> {
	return get(`/${orgKey}/${appKey}/${version}`, headers);
}

export function createVersion(orgKey: string, appKey: string, form: { original_form: { type?: string; data: string }; visibility?: string }, headers: Headers): Promise<globalThis.Response> {
	return post(`/${orgKey}/${appKey}`, headers, form);
}

export function deleteVersion(orgKey: string, appKey: string, version: string, headers: Headers): Promise<globalThis.Response> {
	return del(`/${orgKey}/${appKey}/${version}`, headers);
}

export function getExample(orgKey: string, appKey: string, version: string, typeName: string, headers: Headers, params?: { sub_type_name?: string; optional_fields?: boolean }): Promise<globalThis.Response> {
	return get(`/${orgKey}/${appKey}/${version}/example/${typeName}`, headers, params);
}

// === Code ===

export function getCode(orgKey: string, appKey: string, version: string, generatorKey: string, headers: Headers): Promise<globalThis.Response> {
	return get(`/${orgKey}/${appKey}/${version}/${generatorKey}`, headers);
}

export function postCode(orgKey: string, appKey: string, version: string, generatorKey: string, form: { attributes: { name: string; value: string }[] }, headers: Headers): Promise<globalThis.Response> {
	return post(`/${orgKey}/${appKey}/${version}/${generatorKey}`, headers, form);
}

// === Generators ===

export function getGenerators(headers: Headers, params?: { key?: string; service_guid?: string; limit?: number; offset?: number }): Promise<globalThis.Response> {
	return get('/generators', headers, params);
}

export function getGeneratorByKey(key: string, headers: Headers): Promise<globalThis.Response> {
	return get(`/generators/${key}`, headers);
}

// === Generator Services ===

export function getGeneratorServices(headers: Headers, params?: { guid?: string; uri?: string; generator_key?: string; limit?: number; offset?: number }): Promise<globalThis.Response> {
	return get('/generator_services', headers, params);
}

export function getGeneratorServiceByGuid(guid: string, headers: Headers): Promise<globalThis.Response> {
	return get(`/generator_services/${guid}`, headers);
}

export function createGeneratorService(form: { uri: string }, headers: Headers): Promise<globalThis.Response> {
	return post('/generator_services', headers, form);
}

export function deleteGeneratorService(guid: string, headers: Headers): Promise<globalThis.Response> {
	return del(`/generator_services/${guid}`, headers);
}

// === Subscriptions ===

export function getSubscriptions(headers: Headers, params?: { organization_key?: string; user_guid?: string; publication?: string; limit?: number; offset?: number }): Promise<globalThis.Response> {
	return get('/subscriptions', headers, params);
}

export function createSubscription(form: { organization_key: string; user_guid: string; publication: string }, headers: Headers): Promise<globalThis.Response> {
	return post('/subscriptions', headers, form);
}

export function deleteSubscription(guid: string, headers: Headers): Promise<globalThis.Response> {
	return del(`/subscriptions/${guid}`, headers);
}

// === Watches ===

export function getWatches(headers: Headers, params?: { user_guid?: string; organization_key?: string; application_key?: string; limit?: number; offset?: number }): Promise<globalThis.Response> {
	return get('/watches', headers, params);
}

export function createWatch(form: { user_guid: string; organization_key: string; application_key: string }, headers: Headers): Promise<globalThis.Response> {
	return post('/watches', headers, form);
}

export function deleteWatch(guid: string, headers: Headers): Promise<globalThis.Response> {
	return del(`/watches/${guid}`, headers);
}

// === Tokens ===

export function getTokens(userGuid: string, headers: Headers, params?: { limit?: number; offset?: number }): Promise<globalThis.Response> {
	return get(`/tokens/users/${userGuid}`, headers, params);
}

export function getCleartextToken(guid: string, headers: Headers): Promise<globalThis.Response> {
	return get(`/tokens/${guid}/cleartext`, headers);
}

export function createToken(form: { user_guid: string; description?: string }, headers: Headers): Promise<globalThis.Response> {
	return post('/tokens', headers, form);
}

export function deleteToken(guid: string, headers: Headers): Promise<globalThis.Response> {
	return del(`/tokens/${guid}`, headers);
}

// === Attributes ===

export function getAttributes(headers: Headers, params?: { name?: string; limit?: number; offset?: number }): Promise<globalThis.Response> {
	return get('/attributes', headers, params);
}

export function createAttribute(form: { name: string; description?: string }, headers: Headers): Promise<globalThis.Response> {
	return post('/attributes', headers, form);
}

export function deleteAttribute(name: string, headers: Headers): Promise<globalThis.Response> {
	return del(`/attributes/${name}`, headers);
}

// === Search ===

export function searchItems(headers: Headers, params?: { q?: string; org_key?: string; limit?: number; offset?: number }): Promise<globalThis.Response> {
	return get('/items', headers, params);
}

// === Changes ===

export function getChanges(headers: Headers, params?: { org_key?: string; application_key?: string; from_version?: string; to_version?: string; limit?: number; offset?: number }): Promise<globalThis.Response> {
	return get('/changes', headers, params);
}

// === Password Reset ===

export function requestPasswordReset(email: string): Promise<globalThis.Response> {
	return post('/password_reset_requests', {}, { email });
}

export function resetPassword(token: string, password: string): Promise<globalThis.Response> {
	return post('/password_resets', {}, { token, password });
}

// === Email Verification ===

export function confirmEmailVerification(form: { token: string }, headers: Headers): Promise<globalThis.Response> {
	return post('/email_verification_confirmations', headers, form);
}

// === Validation ===

export function validateSpec(data: string, headers: Headers): Promise<globalThis.Response> {
	return postRaw('/', headers, data);
}
