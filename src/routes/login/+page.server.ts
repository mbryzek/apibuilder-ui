import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { clients, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { SESSION_COOKIE, config } from '$lib/config';
import { isTenantSession, type SessionState } from '$generated/com-bryzek-platform';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.session) {
		throw redirect(303, '/');
	}
	return {
		githubClientId: config.githubClientId,
		appBaseUrl: config.appBaseUrl,
		redirectTo: url.searchParams.get('redirect') || '/',
	};
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const redirectTo = (formData.get('redirectTo') as string) || url.searchParams.get('redirect') || '/';

		if (!email || !password) {
			return fail(400, { errors: [{ message: 'Email and password are required' }] });
		}

		const client = clients();
		const response = await handleApiCall<SessionState>(
			() => client.platform.createTenantSessionLogins({ tenantId: config.tenantId, body: { email, password }, headers: getSessionHeaders() }),
		);

		if ('data' in response && response.data && isTenantSession(response.data)) {
			cookies.set(SESSION_COOKIE, response.data.session.id, {
				path: '/',
				httpOnly: true,
				secure: config.isProduction,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 365,
			});
			throw redirect(303, redirectTo + '?flash=' + encodeURIComponent('Welcome back!') + '&flash_type=success');
		}

		if ('errors' in response) {
			return fail(400, { errors: response.errors });
		}

		return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
	},
};
