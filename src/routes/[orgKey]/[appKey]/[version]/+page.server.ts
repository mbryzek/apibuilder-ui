import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { createWatch, deleteWatch, deleteVersion, getSessionHeaders } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuthForAction, requireMemberForAction } from '$lib/server/auth';
import type { Watch } from '$generated/types';

export const load: PageServerLoad = async () => {
	// Data already loaded by layout
	return {};
};

export const actions: Actions = {
	watch: async ({ params, locals }) => {
		const session = requireAuthForAction(locals);
		const headers = getSessionHeaders(session.id);

		const response = await handleApiCall<Watch>(
			() => createWatch({
				user_guid: session.user.id,
				organization_key: params.orgKey,
				application_key: params.appKey,
			}, headers),
		);

		if ('data' in response) {
			throw redirect(303, `/${params.orgKey}/${params.appKey}/${params.version}`);
		}

		return fail(400, { errors: 'errors' in response ? response.errors : [{ message: 'Failed to watch' }] });
	},

	unwatch: async ({ params, locals, request }) => {
		const session = requireAuthForAction(locals);
		const headers = getSessionHeaders(session.id);

		const formData = await request.formData();
		const watchGuid = formData.get('watch_guid') as string;

		if (watchGuid) {
			await handleApiCall<void>(() => deleteWatch(watchGuid, headers));
		}

		throw redirect(303, `/${params.orgKey}/${params.appKey}/${params.version}`);
	},

	deleteVersion: async ({ params, locals }) => {
		const session = await requireMemberForAction(locals, params.orgKey);
		const headers = getSessionHeaders(session.id);

		const response = await handleApiCall<void>(
			() => deleteVersion(params.orgKey, params.appKey, params.version, headers),
		);

		if ('data' in response) {
			throw redirect(303, `/${params.orgKey}/${params.appKey}/latest?flash=${encodeURIComponent('Version deleted')}&flash_type=success`);
		}

		return fail(400, { errors: 'errors' in response ? response.errors : [{ message: 'Failed to delete version' }] });
	},
};
