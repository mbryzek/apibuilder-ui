import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAdminForAction } from '$lib/server/auth';
import { redirectWithFlash } from '$lib/server/flash';
import type { Organization, OrganizationForm } from '$generated/com-bryzek-apibuilder';
import type { Visibility } from '$generated/com-bryzek-apibuilder';

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
			() => apiBuilderClient().updateOrganizationByKey({ key: params.orgKey, body: form as OrganizationForm, headers }),
		);

		if ('data' in response) {
			const newKey = response.data.key;
			redirectWithFlash(`/${newKey}/details`, 'Organization updated');
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
			redirectWithFlash('/', 'Organization deleted');
		}

		if ('errors' in response) {
			return fail(400, { errors: response.errors });
		}

		return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
	},
};
