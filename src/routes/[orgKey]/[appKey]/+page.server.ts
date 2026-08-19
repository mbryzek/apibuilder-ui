import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { assertSafePathParams } from '$lib/server/path-params';

export const load: PageServerLoad = async ({ params }) => {
  // Both params are reflected into the Location header, which SvelteKit sets verbatim. Nothing
  // else in this load would refuse a forged key: the sibling `[orgKey]` layout happens to 404
  // first today, which is a property of branch ordering two files away rather than of this route.
  assertSafePathParams(params);
  throw redirect(302, `/${params.orgKey}/${params.appKey}/latest`);
};
