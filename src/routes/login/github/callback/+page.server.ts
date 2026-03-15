import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { authenticateGithub, exchangeGithubCode, type TenantSession } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import { SESSION_COOKIE, config } from '$lib/config';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');

	if (!code) {
		throw redirect(303, '/login?flash=' + encodeURIComponent('GitHub authentication failed: no code provided') + '&flash_type=error');
	}

	const githubClientSecret = env['GITHUB_CLIENT_SECRET'] || '';

	let accessToken: string;
	try {
		accessToken = await exchangeGithubCode(code, githubClientSecret);
	} catch (err) {
		const msg = err instanceof Error ? err.message : 'Failed to exchange GitHub code';
		throw redirect(303, '/login?flash=' + encodeURIComponent(msg) + '&flash_type=error');
	}

	const response = await handleApiCall<TenantSession>(
		() => authenticateGithub(accessToken),
	);

	if ('data' in response && response.data) {
		cookies.set(SESSION_COOKIE, response.data.session.id, {
			path: '/',
			httpOnly: true,
			secure: config.isProduction,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 365,
		});
		throw redirect(303, '/?flash=' + encodeURIComponent('Welcome!') + '&flash_type=success');
	}

	const errorMsg = 'errors' in response && response.errors.length > 0
		? response.errors[0]!.message
		: 'GitHub authentication failed';

	throw redirect(303, '/login?flash=' + encodeURIComponent(errorMsg) + '&flash_type=error');
};
