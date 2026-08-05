import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { platformClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { dataOr, loadErrorFrom } from '$lib/api/load-error';
import { requireAuth, requireAuthForAction } from '$lib/server/auth';
import type { CleartextToken } from '$generated/com-bryzek-platform';

export const load: PageServerLoad = async (event) => {
  const session = requireAuth(event);
  const headers = getSessionHeaders(session.id);

  const response = await handleApiCall<CleartextToken>(() => platformClient().getTokenCleartextById(event.params.guid, { headers }));

  return {
    tokenGuid: event.params.guid,
    cleartextToken: dataOr<CleartextToken | null>(response, null)?.token ?? null,
    // A 404 is the normal "already displayed" state — the cleartext is deliberately
    // unavailable after the first view. Every other failure is a failure, and saying
    // "already displayed" for it hides a token the user just created.
    loadError: response.status === 404 ? null : loadErrorFrom(response)
  };
};

export const actions: Actions = {
  delete: async ({ params, locals }) => {
    const session = requireAuthForAction(locals);
    const headers = getSessionHeaders(session.id);

    const response = await handleApiCall<void>(() => platformClient().deleteTokenById(params.guid, { headers }));

    if ('errors' in response) {
      return fail(Math.max(response.status, 400), { errors: response.errors });
    }

    throw redirect(303, '/tokens');
  }
};
