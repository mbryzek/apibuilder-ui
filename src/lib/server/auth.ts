import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

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
