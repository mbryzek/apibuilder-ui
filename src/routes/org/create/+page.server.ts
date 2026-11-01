import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '#lib/api/clients.ts';
import { handleApiCall, isApiError } from '#lib/api/error-handler.ts';
import { actionFail } from '#lib/api/action-error.ts';
import { requireAuthForAction, requireAuthLoad } from '#lib/server/auth.ts';
import { optionalString, requiredEnum, requiredString } from '#lib/server/form.ts';
import { redirectWithFlash } from '#lib/server/flash.ts';
import type { Organization, OrganizationForm } from '#generated/com-bryzek-apibuilder.ts';
import { Visibility } from '#generated/com-bryzek-apibuilder.ts';

export const load: PageServerLoad = requireAuthLoad;

export const actions: Actions = {
  default: async ({ request, locals, cookies }) => {
    // The shared guard, not a hand-rolled `locals.session` check: a session lookup that got no
    // answer is a 503 there, where a redirect to /login would drop everything typed below.
    const session = requireAuthForAction(locals);

    const formData = await request.formData();
    const name = requiredString(formData, 'name');
    const namespace = requiredString(formData, 'namespace');
    const key = optionalString(formData, 'key');
    const visibility = requiredEnum(formData, 'visibility', Object.values(Visibility)) ?? Visibility.Organization;
    // Travels back with every refusal, so a submission the server turns down keeps what was typed.
    const values = { name: name ?? '', namespace: namespace ?? '', key: key ?? '', visibility };

    if (!name || !namespace) {
      return fail(400, { errors: [{ message: 'Name and namespace are required' }], ...values });
    }

    const body: OrganizationForm = { name, namespace, visibility };
    if (key) {
      body.key = key;
    }

    const headers = getSessionHeaders(session.id);
    const response = await handleApiCall<Organization>(() => apiBuilderClient({ headers }).createOrganization({ body }));

    if (isApiError(response)) {
      return actionFail(response, values);
    }

    redirectWithFlash(cookies, '/' + response.data.key, 'Organization created successfully');
  }
};
