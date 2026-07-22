import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { clearSessionCookie } from '$lib/server/session';

export const load: PageServerLoad = async ({ cookies }) => {
  clearSessionCookie(cookies);
  throw redirect(303, '/logged-out');
};

export const actions: Actions = {
  default: async ({ cookies }) => {
    clearSessionCookie(cookies);
    throw redirect(303, '/logged-out');
  }
};
