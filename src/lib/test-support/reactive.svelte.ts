/**
 * Props a spec can change after mounting, as a navigation changes a page's `data`.
 *
 * `$state` makes the object a deep proxy, so assigning `props.data = { ... }` updates the mounted
 * component the way SvelteKit does. A rune is only available in a `.svelte.ts` module, which is why
 * this one exists rather than each spec declaring the state itself.
 */
export function reactiveProps<T extends object>(initial: T): T {
  const props = $state(initial);
  return props;
}
