import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { resetPassword } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import { SESSION_COOKIE, config } from '$lib/config';
import type { Authentication } from '$generated/types';

export const load: PageServerLoad = async ({ params }) => {
	return { token: params.token };
};

export const actions: Actions = {
	default: async ({ request, params, cookies }) => {
		const formData = await request.formData();
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirm_password') as string;

		if (!password) {
			return fail(400, { errors: [{ message: 'Password is required' }] });
		}

		if (password !== confirmPassword) {
			return fail(400, { errors: [{ message: 'Passwords do not match' }] });
		}

		const response = await handleApiCall<Authentication>(
			() => resetPassword(params.token, password),
		);

		if ('data' in response && response.data) {
			cookies.set(SESSION_COOKIE, response.data.session.id, {
				path: '/',
				httpOnly: true,
				secure: config.isProduction,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 365,
			});
			throw redirect(303, '/?flash=' + encodeURIComponent('Password reset successfully!') + '&flash_type=success');
		}

		if ('errors' in response) {
			return fail(400, { errors: response.errors });
		}

		return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
	},
};
