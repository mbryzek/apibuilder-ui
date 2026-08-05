import type { PublicSession, Session } from '$lib/session';

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
