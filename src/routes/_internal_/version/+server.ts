import { PUBLIC_VERSION, PUBLIC_RELEASED_AT, PUBLIC_SOURCE_HOST } from '$app/env/public';
import type { RequestHandler } from './$types';

// PUBLIC_VERSION / PUBLIC_RELEASED_AT are exported into the build environment
// by release-sveltekit (stamped from ~/.devops/versions/<app>.env) and baked
// in here at build time, with PUBLIC_SOURCE_HOST, the git host the released
// commit came from (git.idempotent.io for a Depot release). Dev builds fall
// back to the empty defaults in .env.
export const GET: RequestHandler = async () => {
  // dry-copy: sveltekit/version-endpoint-payload — every copy of this region must match; `dev repo copies` checks it (ISS-3894)
  return Response.json({
    version: PUBLIC_VERSION || null,
    released_at: PUBLIC_RELEASED_AT || null,
    source_host: PUBLIC_SOURCE_HOST || null
  });
  // dry-copy-end
};
