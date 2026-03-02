import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return new Response('healthy', {
		headers: { 'Content-Type': 'text/plain' },
	});
};
