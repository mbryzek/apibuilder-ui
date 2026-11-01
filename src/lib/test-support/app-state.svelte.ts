/**
 * Test double for `$app/state`, aliased over the real module in vitest.config.ts.
 *
 * A mounted page has no router to fill `page` in, so a spec sets the parts the page reads. It is
 * reactive state, so a spec that changes `params` sees the page re-derive from them, as a client-side
 * navigation would make it.
 */
export const page = $state<{ params: Record<string, string>; url: URL }>({
  params: {},
  url: new URL('http://localhost/')
});
