import { redirect, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getMemberships, getSessionHeaders } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import type { Membership } from '$generated/types';
import { MembershipRole } from '$generated/types';

export function requireAuth(event: RequestEvent): NonNullable<App.Locals['session']> {
	const { locals, url } = event;
	if (!locals.session) {
		const redirectTo = url.pathname + url.search;
		throw redirect(303, '/login?redirect=' + encodeURIComponent(redirectTo));
	}
	return locals.session;
}

export function requireAuthForAction(locals: App.Locals): NonNullable<App.Locals['session']> {
	if (!locals.session) {
		throw redirect(302, '/login');
	}
	return locals.session;
}

export async function requireMemberForAction(locals: App.Locals, orgKey: string): Promise<NonNullable<App.Locals['session']>> {
	const session = requireAuthForAction(locals);
	const headers = getSessionHeaders(session.id);
	const response = await handleApiCall<Membership[]>(
		() => getMemberships({ org_key: orgKey, user_guid: session.user.id }, headers),
	);
	if (!('data' in response) || response.data.length === 0) {
		throw error(403, 'Forbidden');
	}
	return session;
}

export async function requireAdminForAction(locals: App.Locals, orgKey: string): Promise<NonNullable<App.Locals['session']>> {
	const session = requireAuthForAction(locals);
	const headers = getSessionHeaders(session.id);
	const response = await handleApiCall<Membership[]>(
		() => getMemberships({ org_key: orgKey, user_guid: session.user.id, role: MembershipRole.Admin }, headers),
	);
	if (!('data' in response) || response.data.length === 0) {
		throw error(403, 'Forbidden');
	}
	return session;
}
