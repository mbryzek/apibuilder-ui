import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { getSessionHeaders } from '$lib/api/clients';
import { config } from '$lib/config';

// TODO: No generated client method for getExample — inline fetch until API spec is updated
export const GET: RequestHandler = async ({ params, locals, url }) => {
  const headers = getSessionHeaders(locals.session?.id);

  const optionalFields = url.searchParams.get('optional_fields') === 'true';

  // Encode each path segment: org/app/version/typeName come from the request URL and
  // can contain characters (e.g. '.' in a version, or a namespaced type name) that must
  // not be interpolated raw into the upstream URL.
  const path = [params.orgKey, params.appKey, params.version, 'example', params.typeName]
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  const query = new URLSearchParams();
  if (optionalFields) {
    query.set('optional_fields', 'true');
  }
  const queryString = query.toString();
  const fetchUrl = `${config.apiBaseUrl}/apibuilder/${path}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(fetchUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });

  if (!response.ok) {
    // Do not collapse every upstream failure to 404: a private spec (401/403), a rate limit, or an
    // upstream outage all told the user "Example not found", which is simply untrue and sends them
    // looking for a missing type instead of signing in or retrying.
    if (response.status === 401 || response.status === 403) {
      throw error(response.status, 'Not authorized to view this example');
    }
    if (response.status === 404) {
      throw error(404, 'Example not found');
    }
    throw error(502, `Upstream error (${response.status})`);
  }

  const data: unknown = await response.json();

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
