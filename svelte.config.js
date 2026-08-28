// dry-copy: sveltekit/reap-leaked-children
import { execFileSync } from 'node:child_process';
import { isMainThread } from 'node:worker_threads';

/**
 * KILL WHAT THIS PROCESS STILL OWNS WHEN IT EXITS.
 *
 * `@sveltejs/adapter-cloudflare`'s `emulate()` calls wrangler's `getPlatformProxy()`, which
 * starts a miniflare `workerd`, and the adapter disposes it nowhere. SvelteKit calls
 * `emulate()` from its prerender pass, and that pass runs in a worker THREAD rather than a
 * subprocess — so the `workerd` is a child of THIS pid, it outlives the build, and it is
 * reparented to init still holding two loopback-specific ephemeral ports. Every `vite build`
 * of a prerendering app leaks exactly one.
 *
 * A held loopback port is not inert. A wildcard bind does not reserve a port: the kernel's
 * wildcard allocator hands out `0.0.0.0:N` while the squatter keeps `127.0.0.1:N`, both binds
 * coexist, and a connection to `127.0.0.1:N` goes to the MOST SPECIFIC listener — the
 * squatter. That is how a frontend build makes an unrelated repo's forked test runner hang on
 * a handshake nothing will ever answer.
 *
 * This matches on nothing — not a process name, not an age, not a port. A direct child still
 * alive once `exit` has been reached is provably ours (it is a child of this pid) and provably
 * finished with (this process is going away), which is true of any daemon a build leaves
 * behind and not only of `workerd`.
 *
 * This region is copied verbatim into every SvelteKit repo in this account that builds on
 * `adapter-cloudflare`. The `dry-copy` markers are the declaration — `dev repo copies`
 * enumerates every copy carrying them and reports one that has drifted, so a change here
 * that does not reach the others is caught rather than merely regretted (ISS-3894).
 *
 * Delete this once every repo carrying this block is on `@sveltejs/adapter-cloudflare`
 * v8+. v8 drops `emulate()`: the platform proxy moves into a Vite plugin that runs only
 * for dev and preview servers, so a build never creates one. The adapter still disposes
 * the proxy nowhere, so the version is the trigger to watch for — not a `dispose()` call,
 * which is not coming. The check is that `emulate` no longer appears in
 * `node_modules/@sveltejs/adapter-cloudflare/index.js`. ISS-5600
 */
if (isMainThread) {
  // Absolute path so nothing earlier on PATH can change what runs, and `-P` so the only thing
  // this can ever name is a child of this pid. Never a pattern: on a machine running several
  // builds at once a pattern matches the other builds too. `pgrep` exits 1 when there are no
  // children and is absent on some platforms; neither is worth a word on a build that has
  // otherwise succeeded.
  const ownChildren = () => {
    try {
      return execFileSync('/usr/bin/pgrep', ['-P', String(process.pid)], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore']
      })
        .split('\n')
        .map((line) => Number(line.trim()))
        .filter((pid) => pid > 0);
    } catch {
      return [];
    }
  };

  let reaped = false;
  process.on('exit', () => {
    if (reaped) return;
    reaped = true;

    let killed = 0;
    for (const pid of ownChildren()) {
      try {
        process.kill(pid, 'SIGTERM');
        killed++;
      } catch {
        // Already gone between the listing and the signal.
      }
    }

    // Say so rather than reaping in silence: this line is how anyone learns the leak is still
    // there, and its absence is how they learn it is not.
    if (killed > 0) {
      try {
        console.error(`svelte.config.js: reaped ${killed} leftover child process(es) — ISS-5600`);
      } catch {
        // stderr already closed
      }
    }
  });
}
// dry-copy-end

import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      routes: {
        include: ['/*'],
        exclude: ['<all>']
      }
    }),
    alias: {
      $generated: 'src/generated'
    },
    // The Content-Security-Policy lives here rather than in hooks.server.ts because only SvelteKit
    // can nonce the hydration bootstrap it injects into every page. Hand-building the header meant
    // the only way to keep that one inline <script> running was `script-src 'unsafe-inline'`, which
    // is very nearly the same as having no script-src at all -- bd4222d removed the session id from
    // the page payload for exactly that reason ("any injected inline script could read
    // page.data.session.id") and then left the directive that enabled it in place.
    //
    // `mode: 'auto'` nonces dynamically rendered pages and hashes prerendered ones. Nothing in this
    // app prerenders today, so every page takes the nonce path; the hash path is there so adding
    // `export const prerender = true` to a route does not silently break it.
    csp: {
      mode: 'auto',
      directives: {
        'default-src': ['self'],
        // No 'unsafe-inline' here, and it must stay that way: SvelteKit appends a per-request
        // 'nonce-...' to this directive and stamps the same nonce on the bootstrap script. Putting
        // 'unsafe-inline' back would not merely widen the policy -- browsers *ignore* it once a
        // nonce is present, so it would look like a loosening and behave like nothing at all.
        'script-src': ['self'],
        // 'unsafe-inline' here IS load-bearing, in the opposite direction. SvelteKit only nonces
        // style-src when the directive does not already allow inline styles (its csp.js
        // `style_needs_csp`), and a nonce on style-src voids 'unsafe-inline' for style ATTRIBUTES
        // too -- app.html ships `style="margin: 0; padding: 0"` on <body> and `style="display:
        // contents"` on the body wrapper, which would stop applying. Tightening this is a separate
        // change that has to remove those attributes first.
        'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
        'font-src': ['self', 'https://fonts.gstatic.com'],
        'img-src': ['self', 'data:', 'https:'],
        // 'self' is the entire connect surface. Every apibuilder/platform API call is made from a
        // +page.server.ts, +layout.server.ts, +server.ts or hooks.server.ts -- there are no
        // universal loads and no browser-side client -- so `config.apiBaseUrl` never reaches the
        // client bundle (verified: no client chunk contains it after a production build). The one
        // fetch() in a component (ExampleJsonLinks) calls this app's own /example endpoint.
        'connect-src': ['self'],
        'object-src': ['none'],
        'frame-ancestors': ['none'],
        'base-uri': ['self'],
        'form-action': ['self']
      }
    }
  }
};

export default config;
