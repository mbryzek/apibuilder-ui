import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAuthForAction } from '$lib/server/auth';
import type { Subscription } from '$generated/types';
import { Publication } from '$generated/types';

export const load: PageServerLoad = async (event) => {
	const session = requireAuth(event);
	const headers = getSessionHeaders(session.id);

	const response = await handleApiCall<Subscription[]>(
		() => event.locals.apiClient.getSubscriptions({ organizationKey: event.params.orgKey, userGuid: session.user.guid, limit: 100, offset: 0, headers }),
	);

	return {
		subscriptions: 'data' in response ? response.data : [],
	};
};

export const actions: Actions = {
	toggle: async ({ request, params, locals }) => {
		const session = requireAuthForAction(locals);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();
		const publication = formData.get('publication');
		const subscriptionGuid = formData.get('subscription_guid') as string | null;

		if (!publication || typeof publication !== 'string' || !Object.values(Publication).includes(publication as Publication)) {
			return fail(400, { errors: [{ message: 'Invalid publication' }] });
		}

		if (subscriptionGuid) {
			const response = await handleApiCall<void>(
				() => locals.apiClient.deleteSubscriptionByGuid(subscriptionGuid, { headers }),
			);
			if ('errors' in response) {
				return fail(400, { errors: response.errors });
			}
		} else {
			const response = await handleApiCall<Subscription>(
				() => locals.apiClient.createSubscription({
					body: {
						organization_key: params.orgKey,
						user_guid: session.user.guid,
						publication: publication as Publication,
					},
					headers,
				}),
			);
			if ('errors' in response) {
				return fail(400, { errors: response.errors });
			}
		}

		return { success: true };
	},
};
