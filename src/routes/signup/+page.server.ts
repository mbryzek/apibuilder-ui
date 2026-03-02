import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { createUser, authenticateEmail } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import { SESSION_COOKIE, config } from '$lib/config';
import type { Authentication, User } from '$generated/types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.session) {
		throw redirect(303, '/');
	}
	return {
		githubClientId: config.githubClientId,
		appBaseUrl: config.appBaseUrl,
	};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const name = formData.get('name') as string;

		if (!email || !password) {
			return fail(400, { errors: [{ message: 'Email and password are required' }], email, name });
		}

		const form = name ? { email, password, name } : { email, password };
		const createResponse = await handleApiCall<User>(
			() => createUser(form),
		);

		if ('errors' in createResponse) {
			return fail(400, { errors: createResponse.errors, email, name });
		}

		// Auto-login after successful signup
		const authResponse = await handleApiCall<Authentication>(
			() => authenticateEmail(email, password),
		);

		if ('data' in authResponse && authResponse.data) {
			cookies.set(SESSION_COOKIE, authResponse.data.session.id, {
				path: '/',
				httpOnly: true,
				secure: config.isProduction,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 365,
			});
			throw redirect(303, '/?flash=' + encodeURIComponent('Welcome to API Builder!') + '&flash_type=success');
		}

		// User created but auto-login failed — send to login page
		throw redirect(303, '/login?flash=' + encodeURIComponent('Account created! Please sign in.') + '&flash_type=success');
	},
};
