/**
 * GitHub OAuth utilities
 */

import { config } from '$lib/config';

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
