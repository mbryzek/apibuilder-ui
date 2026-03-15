import type { PageServerLoad, Actions } from './$types';
import { redirect, fail, error } from '@sveltejs/kit';
import { getGeneratorServiceByGuid, getGenerators, deleteGeneratorService } from '$lib/api/legacy';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuthForAction } from '$lib/server/auth';
import type { GeneratorService, GeneratorWithService } from '$generated/types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

	const serviceResponse = await handleApiCall<GeneratorService>(
		() => getGeneratorServiceByGuid(params.guid, headers),
	);

	if (!('data' in serviceResponse)) {
		throw error(serviceResponse.status === 404 ? 404 : 500, 'Generator service not found');
	}

	const service = serviceResponse.data;

	const generatorsResponse = await handleApiCall<GeneratorWithService[]>(
		() => getGenerators(headers, { service_guid: params.guid, limit: 100 }),
	);

	const generators = 'data' in generatorsResponse ? generatorsResponse.data : [];

	return {
		service,
		generators,
	};
};

export const actions: Actions = {
	delete: async ({ params, locals }) => {
		const session = requireAuthForAction(locals);
		const headers = getSessionHeaders(session.id);

		const response = await handleApiCall<void>(
			() => deleteGeneratorService(params.guid, headers),
		);

		if ('errors' in response) {
			return fail(Math.max(response.status, 400), { errors: response.errors });
		}

		throw redirect(303, '/generators');
	},
};
