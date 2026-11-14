import { cliResponse } from '#lib/server/cli.ts';
import type { RequestHandler } from './$types';

// The public api CLI's downloads, which install.sh reads: see #lib/server/cli.ts. ISS-86630
export const GET: RequestHandler = ({ params }) => cliResponse(params.path);
