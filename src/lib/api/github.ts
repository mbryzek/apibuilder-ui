/**
 * GitHub OAuth utilities
 */

import { config } from '$lib/config';

interface GithubTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

export async function exchangeGithubCode(code: string, githubClientSecret: string): Promise<string> {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      client_id: config.githubClientId,
      client_secret: githubClientSecret,
      code
    })
  });
  if (!response.ok) {
    throw new Error(`GitHub token exchange failed (${response.status})`);
  }
  const data = (await response.json()) as GithubTokenResponse;
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }
  if (!data.access_token) {
    throw new Error('GitHub token exchange did not return an access token');
  }
  return data.access_token;
}
