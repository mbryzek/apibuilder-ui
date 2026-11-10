import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
  PUBLIC_VERSION: { public: true, static: true },
  PUBLIC_RELEASED_AT: { public: true, static: true },
  // The Worker secret the release sets from monitoring's live report token (DES-65431). Absent in
  // dev and wherever a release could not read it: the screen report then posts nothing.
  OBS_REPORT_TOKEN: { schema: (value) => value || undefined, description: 'The screen report door token' }
});
