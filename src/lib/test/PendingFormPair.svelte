<script lang="ts">
  // Two sibling PendingForms, the shape the page-level flag got wrong: one submit must not
  // disable the other form. Mounted by src/lib/components/PendingForm.test.ts.
  import PendingForm from '$lib/components/PendingForm.svelte';

  interface Props {
    onSettled?: () => void;
  }

  let { onSettled }: Props = $props();
</script>

<PendingForm action="?/first" {onSettled}>
  {#snippet children(pending)}
    <button type="submit" data-testid="first" disabled={pending}>First</button>
  {/snippet}
</PendingForm>

<PendingForm action="?/second">
  {#snippet children(pending)}
    <button type="submit" data-testid="second" disabled={pending}>Second</button>
  {/snippet}
</PendingForm>
