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
 */
export type PublicSession = {
  user: User;
};

declare global {
  namespace App {
    interface Locals {
      session?: Session | undefined;
      /**
       * The session lookup never got an answer, so `session` being absent means "unknown", not
       * "signed out". Public routes still render anonymously; the guards in `lib/server/auth.ts`
       * check this before deciding someone needs to sign in.
       */
      sessionUnavailable?: boolean | undefined;
    }
    interface PageData {
      session?: PublicSession | undefined;
    }
  }
}

export {};
