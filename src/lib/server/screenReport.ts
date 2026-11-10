import { OBS_REPORT_TOKEN } from '$app/env/private';
import type { ScreenReportConfig } from '#lib/telemetry/server.ts';
import { budgets } from '#lib/telemetry/budgets.ts';

/**
 * This app's screen report (DES-65431): where both halves of a screen view go, and what each screen
 * is held to. One config, read by the request hook and by `/_telemetry`. Every backend call is
 * made by the server, so there is no same-origin API proxy to skip.
 */
export const screenReport: ScreenReportConfig = {
  app: 'apibuilder-ui',
  repo: 'mbryzek/apibuilder-ui',
  budgets,
  token: () => OBS_REPORT_TOKEN
};
