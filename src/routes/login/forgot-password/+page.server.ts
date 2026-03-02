import type { Actions } from './$types';
import { handleApiCall } from '$lib/api/error-handler';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;

		if (!email) {
			return { success: false, errors: [{ message: 'Email is required' }] };
		}

		await handleApiCall<void>(
			() => locals.apiClient.createPasswordResetRequest({ body: { email }, headers: {} }),
		);

		// Always show success regardless of whether email exists
		return { success: true };
	},
};
