import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getSessionById, type TenantSession } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import { SESSION_COOKIE, config } from '$lib/config';

export const load: PageServerLoad = async ({ cookies }) => {
	const response = await handleApiCall<TenantSession>(
		() => getSessionById('dev'),
	);

	if ('data' in response && response.data) {
		cookies.set(SESSION_COOKIE, response.data.session.id, {
			path: '/',
			httpOnly: true,
			secure: config.isProduction,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 365,
		});
		throw redirect(303, '/?flash=' + encodeURIComponent('Logged in as dev') + '&flash_type=success');
	}

	throw redirect(303, '/login?flash=' + encodeURIComponent('Developer login not enabled') + '&flash_type=error');
};
