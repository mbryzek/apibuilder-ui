import type { Handle } from '@sveltejs/kit';
import { getSessionById, getSessionHeaders } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import { SESSION_COOKIE, config } from '$lib/config';
import type { Authentication } from '$generated/types';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(SESSION_COOKIE) || undefined;

	if (sessionId) {
		const headers = getSessionHeaders(sessionId);
		const response = await handleApiCall<Authentication>(
			() => getSessionById(sessionId, headers),
			{
				onUnauthorized: () => {
					event.cookies.delete(SESSION_COOKIE, { path: '/' });
					event.locals.session = undefined;
				},
			},
		);

		if ('data' in response && response.data) {
			event.locals.session = {
				id: sessionId,
				user: response.data.user,
			};
		} else {
			event.locals.session = undefined;
		}
	} else {
		event.locals.session = undefined;
	}

	const res = await resolve(event);

	res.headers.set('X-Frame-Options', 'DENY');
	res.headers.set('X-Content-Type-Options', 'nosniff');
	res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

	if (config.isProduction) {
		res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
	}

	res.headers.set('Content-Security-Policy', [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline'",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"font-src 'self' https://fonts.gstatic.com",
		"img-src 'self' data: https:",
		"connect-src 'self' " + config.apiBaseUrl,
		"frame-ancestors 'none'",
		"base-uri 'self'",
		"form-action 'self'",
	].join('; '));

	return res;
};
