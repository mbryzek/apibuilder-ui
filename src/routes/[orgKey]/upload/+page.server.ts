import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { getSessionHeaders, createVersion } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAuthForAction } from '$lib/server/auth';
import type { Version } from '$generated/types';
import { OriginalType, Visibility } from '$generated/types';

export const load: PageServerLoad = async (event) => {
	requireAuth(event);
	return {};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const session = requireAuthForAction(locals);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();

		const appKey = (formData.get('app_key') as string)?.trim();
		const visibility = (formData.get('visibility') as string) || 'organization';
		const specType = (formData.get('spec_type') as string) || '';
		const file = formData.get('file') as File | null;

		if (!file || file.size === 0) {
			return fail(400, { errors: [{ message: 'Please select a file to upload' }], appKey, visibility, specType });
		}

		const data = await file.text();
		if (!data.trim()) {
			return fail(400, { errors: [{ message: 'Uploaded file is empty' }], appKey, visibility, specType });
		}

		const originalForm: { data: string; type?: OriginalType } = { data };
		if (specType) {
			if (!Object.values(OriginalType).includes(specType as OriginalType)) {
				return fail(400, { errors: [{ message: `Invalid spec type: ${specType}` }], appKey, visibility, specType });
			}
			originalForm.type = specType as OriginalType;
		}

		const validatedVisibility = (visibility || 'organization') as string;
		if (!Object.values(Visibility).includes(validatedVisibility as Visibility)) {
			return fail(400, { errors: [{ message: `Invalid visibility: ${validatedVisibility}` }], appKey, visibility, specType });
		}

		const targetAppKey = appKey || deriveAppKeyFromSpec(data);
		if (!targetAppKey) {
			return fail(400, { errors: [{ message: 'Please provide an application key or ensure your spec includes a name' }], appKey, visibility, specType });
		}

		const response = await handleApiCall<Version>(
			() => createVersion(locals.apiClient, { orgKey: params.orgKey, applicationKey: targetAppKey, body: { original_form: originalForm, visibility: validatedVisibility as Visibility }, headers }),
		);

		if ('data' in response) {
			const v = response.data;
			throw redirect(303, `/${v.organization.key}/${v.application.key}/${v.version}`);
		}

		if ('errors' in response) {
			return fail(Math.max(response.status, 400), { errors: response.errors, appKey, visibility, specType });
		}

		return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
	},
};

function deriveAppKeyFromSpec(data: string): string | undefined {
	try {
		const parsed = JSON.parse(data) as { name?: string };
		if (parsed.name) {
			return parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
		}
	} catch {
		// Not JSON, can't derive key
	}
	return undefined;
}
