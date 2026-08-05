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
