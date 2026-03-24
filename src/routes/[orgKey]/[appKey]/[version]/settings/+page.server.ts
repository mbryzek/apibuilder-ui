import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAdminForAction } from '$lib/server/auth';
import type { Application, Visibility } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async (event) => {
	requireAuth(event);
	return {};
};

export const actions: Actions = {
	updateVisibility: async ({ request, params, locals }) => {
		const session = await requireAdminForAction(locals, params.orgKey);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();
		const client = apiBuilderClient();

		const visibility = formData.get('visibility') as string;
		if (!visibility) {
			return fail(400, { errors: [{ message: 'Visibility is required' }] });
		}

		const response = await handleApiCall<Application>(
			() => client.updateApplicationByAppKey({
				orgKey: params.orgKey,
				appKey: params.appKey,
				body: {
					name: formData.get('name') as string,
					visibility: visibility as Visibility,
				},
				headers,
			}),
		);

		if ('data' in response) {
			throw redirect(303, `/${params.orgKey}/${response.data.key}/${params.version}/settings?flash=${encodeURIComponent('Visibility updated')}&flash_type=success`);
		}

		return fail(Math.max(response.status, 400), { errors: 'errors' in response ? response.errors : [{ message: 'Failed to update' }] });
	},

	deleteApp: async ({ params, locals }) => {
		const session = await requireAdminForAction(locals, params.orgKey);
		const headers = getSessionHeaders(session.id);
		const client = apiBuilderClient();

		const response = await handleApiCall<void>(
			() => client.deleteApplicationByAppKey({ orgKey: params.orgKey, appKey: params.appKey, headers }),
		);

		if ('data' in response) {
			throw redirect(303, `/${params.orgKey}?flash=${encodeURIComponent('Application deleted')}&flash_type=success`);
		}

		return fail(Math.max(response.status, 400), { errors: 'errors' in response ? response.errors : [{ message: 'Failed to delete' }] });
	},
};
