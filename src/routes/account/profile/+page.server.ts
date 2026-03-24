import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth } from '$lib/server/auth';
import type { User, UserForm } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async (event) => {
	const session = requireAuth(event);
	const headers = getSessionHeaders(session.id);
	const response = await handleApiCall<User>(
		() => apiBuilderClient().getUserById(session.user.id, { headers }),
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

		const body: UserForm = { email, nickname };
		if (name) {
			body.name = name;
		}

		const headers = getSessionHeaders(locals.session.id);
		const response = await handleApiCall<User>(
			() => apiBuilderClient().updateUserById({ id: locals.session!.user.id, body, headers }),
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
