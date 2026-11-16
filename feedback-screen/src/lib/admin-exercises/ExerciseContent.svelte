<script>
	import { renderExerciseMarkdown } from './exerciseContent.js';
	let { text = '', markdown = null } = $props();
	const html = $derived(markdown === null ? '' : renderExerciseMarkdown(markdown));
</script>

<div class="exercise-content">
	{#if markdown !== null}
		<!-- Exercise-only DOMPurify tag allowlist, with no attributes, sanitises this sink. -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	{:else}
		{text}
	{/if}
</div>

<style>
	.exercise-content {
		min-width: 0;
		max-width: 100%;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.exercise-content :global(pre) {
		max-width: 100%;
		overflow-x: auto;
		white-space: pre;
		padding: var(--spacing-3);
		border: var(--border-width-1) solid currentColor;
		border-radius: var(--radius-md);
	}
	.exercise-content :global(code) {
		font-family: var(--font-mono);
	}
</style>
