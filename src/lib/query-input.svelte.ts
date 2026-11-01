import { untrack } from 'svelte';
import { goto } from '$app/navigation';
import { listUrl } from '#lib/pagination.ts';

const DEBOUNCE_MS = 250;

/**
 * A list filter that navigates as the reader types (`/search`, `/generators`).
 *
 * The field's text is the reader's, not the page's. Bound one-way to the served `q`, every load that
 * landed wrote its `q` back into the field, so the load for "auth" arriving while the reader was
 * typing "authen" deleted the "en" and moved the cursor. Here a `q` that arrives is written into
 * the field only when this field did not ask for it — a link, Back, a pagination click — and the
 * one it did ask for leaves whatever the reader has typed since.
 *
 * A navigation made while typing replaces the history entry, so Back leaves the list rather than
 * stepping through every prefix of the query. Must be constructed during component init.
 */
export class QueryInput {
  text = $state('');
  readonly #path: string;
  readonly #served: () => string;
  #requested: string | undefined;
  #timer: ReturnType<typeof setTimeout> | undefined;

  constructor(path: string, served: () => string) {
    this.#path = path;
    this.#served = served;
    this.text = served();

    $effect.pre(() => {
      const q = served();
      untrack(() => this.#arrived(q));
    });
    $effect(() => () => clearTimeout(this.#timer));
  }

  /** The reader typed: keep the text, and navigate once they pause. */
  input(text: string): void {
    this.text = text;
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => {
      // Fire-and-forget: the timer fires after the reader paused, with nothing awaiting it.
      void this.#navigate(text, true);
    }, DEBOUNCE_MS);
  }

  /** The reader submitted: navigate now, as a history entry of its own. */
  submit(): Promise<void> {
    clearTimeout(this.#timer);
    return this.#navigate(this.text, false);
  }

  #navigate(text: string, replace: boolean): Promise<void> {
    const q = text.trim();
    // A query equal to the one already served loads nothing new, so no `q` will arrive to settle it.
    this.#requested = q === this.#served() ? undefined : q;
    return goto(listUrl(this.#path, { q }), { reset: false, replace });
  }

  #arrived(q: string): void {
    if (this.#requested !== undefined && q === this.#requested) {
      this.#requested = undefined;
      return;
    }
    clearTimeout(this.#timer);
    this.#requested = undefined;
    this.text = q;
  }
}
