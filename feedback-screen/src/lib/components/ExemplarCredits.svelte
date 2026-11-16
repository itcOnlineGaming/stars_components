<!--
  Who an exemplar is credited to (#243): its author and reviewer by name where they
  agreed to be credited, "Anonymous ..." where they asked not to be, and the AI model
  for an AI review. Exemplars from before consent have no credits and show nothing.
-->
<script lang="ts">
	interface Props {
		credits?: { author: string | null; reviewer: string | null } | null;
	}

	let { credits = null }: Props = $props();
</script>

{#if credits && (credits.author || credits.reviewer)}
	<p class="credits">
		{#if credits.author}Work by {credits.author}{/if}
		{#if credits.author && credits.reviewer}·{/if}
		{#if credits.reviewer}Review by {credits.reviewer}{/if}
	</p>
{/if}

<style>
	.credits {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		margin: var(--spacing-2) 0;
	}
</style>
