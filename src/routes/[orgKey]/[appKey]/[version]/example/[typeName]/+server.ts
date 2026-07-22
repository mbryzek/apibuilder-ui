import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { getSessionHeaders } from '$lib/api/clients';
import { config } from '$lib/config';

// TODO: No generated client method for getExample — inline fetch until API spec is updated
export const GET: RequestHandler = async ({ params, locals, url }) => {
  const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

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
    throw error(404, 'Example not found');
  }

  const data: unknown = await response.json();

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
