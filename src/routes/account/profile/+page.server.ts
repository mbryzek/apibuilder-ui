import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { updateUser, getUserByGuid } from '$lib/api/legacy';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth } from '$lib/server/auth';
import type { User } from '$generated/types';

export const load: PageServerLoad = async (event) => {
	const session = requireAuth(event);
	const headers = getSessionHeaders(session.id);
	const response = await handleApiCall<User>(
		() => getUserByGuid(session.user.id, headers),
	);
	const user = 'data' in response ? response.data : { email: session.user.person.email?.address ?? '', nickname: '', name: undefined };
	return { user };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.session) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const email = formData.get('email') as string;
		const nickname = formData.get('nickname') as string;
		const name = (formData.get('name') as string) || '';

		if (!email || !nickname) {
			return fail(400, { errors: [{ message: 'Email and nickname are required' }] });
		}

		const form: { email: string; nickname: string; name?: string } = { email, nickname };
		if (name) {
			form.name = name;
		}

		const headers = getSessionHeaders(locals.session.id);
		const response = await handleApiCall<User>(
			() => updateUser(locals.session!.user.id, form, headers),
		);

		if ('data' in response) {
			throw redirect(303, '/account/profile?flash=' + encodeURIComponent('Profile updated successfully') + '&flash_type=success');
		}

		if ('errors' in response) {
			return fail(400, { errors: response.errors });
		}

		return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
	},
};
