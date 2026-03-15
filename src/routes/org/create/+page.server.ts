import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth } from '$lib/server/auth';
import type { Organization, OrganizationForm } from '$generated/com-bryzek-bryzek-apibuilder-v0';
import { Visibility } from '$generated/com-bryzek-bryzek-apibuilder-v0';

export const load: PageServerLoad = async (event) => {
	requireAuth(event);
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.session) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const namespace = formData.get('namespace') as string;
		const key = (formData.get('key') as string) || '';
		const visibility = (formData.get('visibility') as string) || Visibility.Organization;

		if (!name || !namespace) {
			return fail(400, { errors: [{ message: 'Name and namespace are required' }] });
		}

		const body: OrganizationForm = { name, namespace, visibility: visibility as Visibility };
		if (key) {
			body.key = key;
		}

		const headers = getSessionHeaders(locals.session.id);
		const response = await handleApiCall<Organization>(
			() => apiBuilderClient().createOrganization({ body, headers }),
		);

		if ('data' in response) {
			throw redirect(303, '/' + response.data.key + '?flash=' + encodeURIComponent('Organization created successfully') + '&flash_type=success');
		}

		if ('errors' in response) {
			return fail(400, { errors: response.errors });
		}

		return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
	},
};
