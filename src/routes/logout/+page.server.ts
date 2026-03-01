import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE } from '$lib/config';

export const load: PageServerLoad = async ({ cookies }) => {
	cookies.delete(SESSION_COOKIE, { path: '/' });
	throw redirect(303, '/logged-out');
};

export const actions: Actions = {
	default: async ({ cookies }) => {
		cookies.delete(SESSION_COOKIE, { path: '/' });
		throw redirect(303, '/logged-out');
	},
};
