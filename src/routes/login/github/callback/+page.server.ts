import type { PageServerLoad } from './$types';
import { exchangeGithubCode } from '$lib/api/github';
import { apiBuilderClient } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { SESSION_COOKIE, config } from '$lib/config';
import { redirectWithFlash } from '$lib/server/flash';
import { env } from '$env/dynamic/private';
import type { Authentication } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');

	if (!code) {
		redirectWithFlash('/login', 'GitHub authentication failed: no code provided', 'error');
	}

	const githubClientSecret = env['GITHUB_CLIENT_SECRET'] || '';

	let accessToken: string;
	try {
		accessToken = await exchangeGithubCode(code, githubClientSecret);
	} catch (err) {
		const msg = err instanceof Error ? err.message : 'Failed to exchange GitHub code';
		redirectWithFlash('/login', msg, 'error');
	}

	const response = await handleApiCall<Authentication>(
		() => apiBuilderClient().createGithubAuthForm({ body: { token: accessToken } }),
	);

	if ('data' in response && response.data) {
		cookies.set(SESSION_COOKIE, response.data.session.id, {
			path: '/',
			httpOnly: true,
			secure: config.isProduction,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 365,
		});
		redirectWithFlash('/', 'Welcome!');
	}

	const errorMsg = 'errors' in response && response.errors.length > 0
		? response.errors[0]!.message
		: 'GitHub authentication failed';

	redirectWithFlash('/login', errorMsg, 'error');
};
