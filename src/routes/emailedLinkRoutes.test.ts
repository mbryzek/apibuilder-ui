import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Every tokenized link the platform mails an apibuilder user is built from a path the PLATFORM
 * owns — `EmailVerificationProcessor` and `PasswordResetProcessor` each hardcode one and resolve
 * the host from `tenants.domain` — so a route in this repo at any other spelling is a dead end
 * for whoever clicks the link, and there is nothing on the platform side that could notice: the
 * mail is sent, the task completes, and the 404 happens in a browser nobody is watching.
 *
 * That is what this list is for. It is not a map of the app's routes; it is the set of paths
 * somebody else decided, checked here so a rename in this repo fails a build instead of quietly
 * unlinking an emailed link.
 *
 * `dir` is where the route lives; `mailedPath` is the URL the platform builds, spelled out so a
 * reader can compare the two without reading Scala.
 */
const EMAILED_LINK_ROUTES = [
  {
    dir: join('email', 'verifications', '[token]'),
    mailedPath: '/email/verifications/<token>',
    mailedBy: 'EmailVerificationProcessor'
  },
  {
    dir: join('login', 'password', 'reset', '[token]'),
    mailedPath: '/login/password/reset/<id>',
    mailedBy: 'PasswordResetProcessor'
  }
];

describe.each(EMAILED_LINK_ROUTES)('the emailed link at $mailedPath ($mailedBy)', ({ dir }) => {
  it('has a route in this repo to land on', () => {
    const routeDir = join(process.cwd(), 'src', 'routes', dir);
    const resolves = existsSync(join(routeDir, '+page.svelte')) || existsSync(join(routeDir, '+page.server.ts'));

    expect(resolves, `src/routes/${dir} serves neither +page.svelte nor +page.server.ts`).toBe(true);
  });
});
