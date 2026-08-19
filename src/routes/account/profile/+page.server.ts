import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall, isApiError } from '$lib/api/error-handler';
import { actionFail } from '$lib/api/action-error';
import { dataOr, loadErrorFrom } from '$lib/api/load-error';
import { requireAuth } from '$lib/server/auth';
import { optionalString, requiredString } from '$lib/server/form';
import { redirectWithFlash } from '$lib/server/flash';
import type { User, UserForm } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async (event) => {
  const session = requireAuth(event);
  const headers = getSessionHeaders(session.id);
  const response = await handleApiCall<User>(() => apiBuilderClient({ headers }).getUserById(session.user.id));
  // Never invent a profile: a blank nickname prefilled into the form is one honest
  // Save away from being written back over the real one.
  return { user: dataOr<User | null>(response, null), loadError: loadErrorFrom(response) };
};

export const actions: Actions = {
  default: async ({ request, locals, cookies }) => {
    if (!locals.session) {
      throw redirect(302, '/login');
    }

    const formData = await request.formData();
    const email = requiredString(formData, 'email');
    const nickname = requiredString(formData, 'nickname');
    const name = optionalString(formData, 'name');

    if (!email || !nickname) {
      return fail(400, { errors: [{ message: 'Email and nickname are required' }] });
    }

    const body: UserForm = { email, nickname };
    if (name) {
      body.name = name;
    }

    const headers = getSessionHeaders(locals.session.id);
    const response = await handleApiCall<User>(() => apiBuilderClient({ headers }).updateUserById({ id: locals.session!.user.id, body }));

    if (isApiError(response)) {
      return actionFail(response);
    }

    redirectWithFlash(cookies, '/account/profile', 'Profile updated successfully');
  }
};
