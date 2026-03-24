import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAuthForAction } from '$lib/server/auth';
import type { Subscription } from '$generated/com-bryzek-apibuilder';
import { Publication } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async (event) => {
	const session = requireAuth(event);
	const headers = getSessionHeaders(session.id);

	const response = await handleApiCall<Subscription[]>(
		() => apiBuilderClient().getSubscriptions({ limit: 100, offset: 0, organizationKey: event.params.orgKey, userId: session.user.id, headers }),
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
		const subscriptionId = formData.get('subscription_id') as string | null;

		if (!publication || typeof publication !== 'string' || !Object.values(Publication).includes(publication as Publication)) {
			return fail(400, { errors: [{ message: 'Invalid publication' }] });
		}

		if (subscriptionId) {
			const response = await handleApiCall<void>(
				() => apiBuilderClient().deleteSubscriptionById(subscriptionId, { headers }),
			);
			if ('errors' in response) {
				return fail(400, { errors: response.errors });
			}
		} else {
			const response = await handleApiCall<Subscription>(
				() => apiBuilderClient().createSubscription({
					body: {
						organization_key: params.orgKey,
						user_id: session.user.id,
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
