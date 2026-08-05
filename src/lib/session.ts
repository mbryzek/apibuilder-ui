import type { User } from '$generated/com-bryzek-platform';

/**
 * The server-side session. `id` is the credential sent as the `session_id` header on every API
 * call, so it must never leave the server — see `PublicSession`.
 */
export type Session = {
  id: string;
  user: User;
};

/**
 * The subset of the session that is safe to serialize into the page payload. The session id is
 * deliberately absent: `PageData` is embedded in the SSR HTML and in every `__data.json`
 * response, so including it would put the credential within reach of any injected script and
 * make the `httpOnly` cookie pointless.
 *
 * This lives in a real module rather than in `app.d.ts` so components can import it by name.
 * Restating the shape by hand in each component's `Props` is what let the two drift: #71 removed
 * the id from the payload and four components went on declaring it as a required string.
 */
export type PublicSession = {
  user: User;
};
