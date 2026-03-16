import type { Actions } from './$types';
import { platformClient } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { config } from '$lib/config';

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;

		if (!email) {
			return { success: false, errors: [{ message: 'Email is required' }] };
		}

		await handleApiCall<void>(
			() => platformClient().createTenantSessionPasswordAndResets({
				tenantId: config.tenantId,
				body: { email },
			}),
		);

		// Always show success regardless of whether email exists
		return { success: true };
	},
};
