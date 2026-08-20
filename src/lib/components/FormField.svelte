<script lang="ts">
  import type { FullAutoFill } from 'svelte/elements';

  /**
   * A labelled text input: the one place the label/input markup and its classes live.
   *
   * Two rules are enforced by construction rather than by review:
   *
   * - There is no `required` prop. A browser that refuses to POST replaces the server's styled,
   *   logged error with an unstyled native bubble, and every field here already has the
   *   authoritative server-side check. `markRequired` renders the asterisk without the attribute.
   * - There is no `email` type. `type="email"` rejects addresses the platform accepts (no-dot
   *   domains, some tagged forms) with a native message this app cannot style or translate.
   *   Address fields pass `inputmode="email"`, which picks the on-screen keyboard and nothing else.
   */
  interface Props {
    label: string;
    name: string;
    type?: 'text' | 'password';
    /** What the field shows. Pass the rejected submission back so a refused edit survives. */
    value?: string;
    inputmode?: 'email';
    autocomplete?: FullAutoFill;
    placeholder?: string;
    /** Explanatory line under the input. */
    hint?: string;
    /** Defaults to `name`, which is what pairs the label with the input. */
    id?: string;
    /** Renders the asterisk. Sets no attribute — the server decides what is required. */
    markRequired?: boolean;
  }

  let {
    label,
    name,
    type = 'text',
    value = '',
    inputmode,
    autocomplete,
    placeholder,
    hint,
    id = name,
    markRequired = false
  }: Props = $props();
</script>

<div>
  <label for={id} class="text-ab-dark-blue mb-1 block text-sm font-medium">
    {label}{#if markRequired}<span class="text-ab-error-red"> *</span>{/if}
  </label>
  <input {type} {id} {name} {value} {inputmode} {autocomplete} {placeholder} class="input-field w-full rounded-lg border px-3 py-2" />
  {#if hint}
    <p class="text-ab-gray mt-1 text-xs">{hint}</p>
  {/if}
</div>
