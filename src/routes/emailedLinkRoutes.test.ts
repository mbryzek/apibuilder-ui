import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { EMAILED_LINK_ROUTES } from 'ui/emailedLink/routes.ts';

/**
 * Every tokenized link the platform mails a user is built from a path the PLATFORM owns, so a
 * route in this repo at any other spelling is a dead end for whoever clicks the link, and nothing
 * on the platform side could notice: the mail is sent, the task completes, and the 404 happens in
 * a browser nobody is watching.
 *
 * That is what this list is for. It is not a map of the app's routes; it is the set of paths
 * somebody else decided, checked here so a rename in this repo fails a build instead of quietly
 * unlinking an emailed link. The links every tenant is mailed are `EMAILED_LINK_ROUTES` from
 * `ui/emailedLink/routes.ts`; a link only this tenant is mailed is added beside them here.
 */
describe.each(EMAILED_LINK_ROUTES)('the emailed link at $mailedPath ($mailedBy)', ({ dir }) => {
  it('has a route in this repo to land on', () => {
    const routeDir = join(process.cwd(), 'src', 'routes', ...dir);
    const resolves = existsSync(join(routeDir, '+page.svelte')) || existsSync(join(routeDir, '+page.server.ts'));

    expect(resolves, `src/routes/${dir.join('/')} serves neither +page.svelte nor +page.server.ts`).toBe(true);
  });
});
