import { config } from '$lib/config';

export async function exchangeGithubCode(code: string, githubClientSecret: string): Promise<string> {
	if (!githubClientSecret) {
		throw new Error('GITHUB_CLIENT_SECRET is not configured');
	}

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

	if (!response.ok) {
		throw new Error(`GitHub OAuth request failed with status ${response.status}`);
	}

	let data: Record<string, string>;
	try {
		data = await response.json();
	} catch {
		throw new Error('GitHub OAuth returned a non-JSON response');
	}

	if (data['error']) {
		throw new Error(data['error_description'] || data['error']);
	}

	if (!data['access_token']) {
		throw new Error('GitHub OAuth response missing access_token');
	}

	return data['access_token'];
}
