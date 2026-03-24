import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAdminForAction } from '$lib/server/auth';
import type { Organization } from '$generated/com-bryzek-apibuilder';
import { Visibility } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async (event) => {
	requireAuth(event);
	return {};
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const session = await requireAdminForAction(locals, params.orgKey);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();

		const name = formData.get('name') as string;
		const namespace = formData.get('namespace') as string;
		const key = formData.get('key') as string;
		const visibility = formData.get('visibility') as string;

		if (!name || !namespace) {
			return fail(400, { errors: [{ message: 'Name and namespace are required' }] });
		}

		const form: { name: string; namespace: string; key?: string; visibility?: Visibility } = { name, namespace };
		if (key) form.key = key;
		if (visibility) form.visibility = visibility as Visibility;

		const response = await handleApiCall<Organization>(
			() => apiBuilderClient().updateOrganizationByKey({ key: params.orgKey, body: form as import('$generated/com-bryzek-apibuilder').OrganizationForm, headers }),
		);

		if ('data' in response) {
			const newKey = response.data.key;
			throw redirect(303, `/${newKey}/details?flash=${encodeURIComponent('Organization updated')}&flash_type=success`);
		}

		if ('errors' in response) {
			return fail(400, { errors: response.errors });
		}

		return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
	},

	delete: async ({ params, locals }) => {
		await requireAdminForAction(locals, params.orgKey);
		const session = locals.session!;
		const headers = getSessionHeaders(session.id);

		const response = await handleApiCall<void>(
			() => apiBuilderClient().deleteOrganizationByKey(params.orgKey, { headers }),
		);

		if ('data' in response) {
			throw redirect(303, `/?flash=${encodeURIComponent('Organization deleted')}&flash_type=success`);
		}

		if ('errors' in response) {
			return fail(400, { errors: response.errors });
		}

		return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
	},
};
