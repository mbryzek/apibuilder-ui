/**
 * The server half of PostHog, which `hooks.server.ts` hands the API-failure events a load or a
 * form action raises. Off while `config.posthog` has no key.
 */
import { createServerPostHog } from 'ui/telemetry/posthog-server.ts';
import { config } from '#lib/config.ts';

export const { captureServerEvent } = createServerPostHog(config.posthog, (message, error) => console.error(message, error));
