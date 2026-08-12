import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireMemberForAction } from '$lib/server/auth';
import type { Version, OriginalForm } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async (event) => {
  requireAuth(event);
  return {};
};

export const actions: Actions = {
  /**
   * `requireMemberForAction` replaces the bare `requireAuthForAction` to match every sibling
   * `[orgKey]` write — `details`, `domains`, `members`, `membership-requests` and `settings` all
   * require admin, `subscriptions` and `deleteVersion` require membership, and this was the only
   * one that asked for nothing but a signed-in session. The page's own "+ Upload" link is already
   * gated on `data.isMember` (`[version]/+page.svelte`), so members-only is the intent the UI has
   * always expressed; the action simply never enforced it, and hiding a link is not access
   * control. Uploading creates or overwrites an application version under `params.orgKey`, which
   * is not something a non-member should be able to do by posting the form directly.
   */
  default: async ({ request, params, locals }) => {
    const session = await requireMemberForAction(locals, params.orgKey);
    const headers = getSessionHeaders(session.id);
    const formData = await request.formData();
    const client = apiBuilderClient();

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

    const originalForm = specType ? { data, type: specType } : { data };

    const targetAppKey = appKey || deriveAppKeyFromSpec(data);
    if (!targetAppKey) {
      return fail(400, {
        errors: [{ message: 'Please provide an application key or ensure your spec includes a name' }],
        appKey,
        visibility,
        specType
      });
    }

    const version = deriveVersionFromSpec(data) || '0.0.1';

    const response = await handleApiCall<Version>(() =>
      client.updateVersionByVersion({
        orgKey: params.orgKey,
        appKey: targetAppKey,
        version,
        body: { original_form: originalForm as OriginalForm },
        headers
      })
    );

    if ('data' in response) {
      throw redirect(303, `/${params.orgKey}/${targetAppKey}/${response.data.version}`);
    }

    if ('errors' in response) {
      return fail(Math.max(response.status, 400), { errors: response.errors, appKey, visibility, specType });
    }

    return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
  }
};

function deriveAppKeyFromSpec(data: string): string | undefined {
  try {
    const parsed = JSON.parse(data) as { name?: string };
    if (parsed.name) {
      return parsed.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
  } catch {
    // Not JSON, can't derive key
  }
  return undefined;
}

function deriveVersionFromSpec(data: string): string | undefined {
  try {
    const parsed = JSON.parse(data) as { version?: string };
    return parsed.version || undefined;
  } catch {
    return undefined;
  }
}
