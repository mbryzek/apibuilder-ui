import type { PageServerLoad } from './$types';
import { platformClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall, isApiSuccess } from '$lib/api/error-handler';
import { messageFor } from '$lib/api/api-message';
import { redirectWithFlash } from '$lib/server/flash';

/**
 * A link that did not verify anything has two quite different explanations, and this page used to
 * give the same answer to both: it joined `response.errors` into the flash text, which for every
 * status but 404 is the generated client's own `Request failed with status 503` — shown to the
 * user, on the homepage. `messageFor` says "we could not reach the server" for an outage; only an
 * answer from the platform means the token itself is the problem.
 */
const INVALID_TOKEN = 'That verification link is no longer valid. Please request a new one.';

export const load: PageServerLoad = async ({ params, locals }) => {
  const headers = getSessionHeaders(locals.session?.id);

  const response = await handleApiCall<void>(() => platformClient().updateEmailVerificationByToken(params.token, { headers }));

  if (isApiSuccess(response)) {
    redirectWithFlash('/', 'Email verified');
  }

  redirectWithFlash('/', response.status === 404 ? INVALID_TOKEN : messageFor(response), 'error');
};
