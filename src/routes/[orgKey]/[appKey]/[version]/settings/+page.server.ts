import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import {
	updateApplication,
	deleteApplication,
	moveApplication,
	getSessionHeaders,
} from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAdminForAction } from '$lib/server/auth';
import type { Application } from '$generated/types';

export const load: PageServerLoad = async (event) => {
	requireAuth(event);
	return {};
};

export const actions: Actions = {
	updateVisibility: async ({ request, params, locals }) => {
		const session = await requireAdminForAction(locals, params.orgKey);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();

		const visibility = formData.get('visibility') as string;
		if (!visibility) {
			return fail(400, { errors: [{ message: 'Visibility is required' }] });
		}

		const response = await handleApiCall<Application>(
			() => updateApplication(params.orgKey, params.appKey, {
				name: formData.get('name') as string,
				visibility: visibility as Application['visibility'],
			}, headers),
		);

		if ('data' in response) {
			throw redirect(303, `/${params.orgKey}/${response.data.key}/${params.version}/settings?flash=${encodeURIComponent('Visibility updated')}&flash_type=success`);
		}

		return fail(Math.max(response.status, 400), { errors: 'errors' in response ? response.errors : [{ message: 'Failed to update' }] });
	},

	move: async ({ request, params, locals }) => {
		const session = await requireAdminForAction(locals, params.orgKey);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();

		const newOrgKey = (formData.get('org_key') as string)?.trim();
		if (!newOrgKey) {
			return fail(400, { errors: [{ message: 'Organization key is required' }] });
		}

		const response = await handleApiCall<Application>(
			() => moveApplication(params.orgKey, params.appKey, { org_key: newOrgKey }, headers),
		);

		if ('data' in response) {
			throw redirect(303, `/${newOrgKey}/${response.data.key}/${params.version}?flash=${encodeURIComponent('Application moved')}&flash_type=success`);
		}

		return fail(Math.max(response.status, 400), { errors: 'errors' in response ? response.errors : [{ message: 'Failed to move' }] });
	},

	deleteApp: async ({ params, locals }) => {
		const session = await requireAdminForAction(locals, params.orgKey);
		const headers = getSessionHeaders(session.id);

		const response = await handleApiCall<void>(
			() => deleteApplication(params.orgKey, params.appKey, headers),
		);

		if ('data' in response) {
			throw redirect(303, `/${params.orgKey}?flash=${encodeURIComponent('Application deleted')}&flash_type=success`);
		}

		return fail(Math.max(response.status, 400), { errors: 'errors' in response ? response.errors : [{ message: 'Failed to delete' }] });
	},
};
