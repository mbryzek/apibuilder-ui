<script lang="ts">
  // Two sibling PendingForms, the shape the page-level flag got wrong: one submit must not
  // disable the other form. Mounted by src/lib/components/PendingForm.test.ts.
  import PendingForm from '#lib/components/PendingForm.svelte';

  interface Props {
    onSettled?: () => void;
    refreshes?: `${string}:${string}`;
    applies?: (data: Record<string, unknown> | undefined) => void;
  }

  let { onSettled, refreshes, applies }: Props = $props();
</script>

<PendingForm action="?/first" {onSettled} {refreshes} {applies}>
  {#snippet children(pending)}
    <button type="submit" data-testid="first" disabled={pending}>First</button>
  {/snippet}
</PendingForm>

<PendingForm action="?/second">
  {#snippet children(pending)}
    <button type="submit" data-testid="second" disabled={pending}>Second</button>
  {/snippet}
</PendingForm>
