import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { confirmEmailVerification, getSessionHeaders } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';

export const load: PageServerLoad = async ({ params, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

	const response = await handleApiCall<void>(
		() => confirmEmailVerification({ token: params.token }, headers),
	);

	if ('data' in response) {
		throw redirect(303, '/?flash=' + encodeURIComponent('Email verified') + '&flash_type=success');
	}

	const errorMessage = 'errors' in response
		? response.errors.map((e) => e.message).join(', ')
		: 'Unable to verify email';

	throw redirect(303, '/?flash=' + encodeURIComponent(errorMessage) + '&flash_type=error');
};
