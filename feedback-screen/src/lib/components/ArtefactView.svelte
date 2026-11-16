<script lang="ts">
	import ProtectedArtefactFile from './ProtectedArtefactFile.svelte';
	import type { Artefact } from '$lib/types.js';
	import { marked } from 'marked';
	import { sanitizeMarkdownHtml } from '$lib/markdownSafety.js';
	import { preserveBlankLines } from '$lib/markdownBlankLines.js';
	import { typesetMarkdown } from '$lib/markdownMath.js';
	import { tick } from 'svelte';

	interface Props {
		artefact: Artefact;
		showCoverLetter?: boolean;
	}

	let { artefact = $bindable(), showCoverLetter = true }: Props = $props();

	let htmlContent: string = $state('');
	let contentElement = $state<HTMLElement>();

	$effect(() => {
		if (artefact && artefact.content) {
			const content = artefact.content;
			const processMarkdown = async () => {
				htmlContent = sanitizeMarkdownHtml(
					await marked(preserveBlankLines(content), { breaks: true })
				);
				console.log('htmlContent', htmlContent);

				await tick();
				if (contentElement) {
					// Scrollable code must also be reachable without a pointer.
					contentElement.querySelectorAll('pre').forEach((block, index) => {
						block.tabIndex = 0;
						block.setAttribute('role', 'region');
						block.setAttribute('aria-label', `Code example ${index + 1}`);
					});
					await typesetMarkdown(contentElement);
				}
			};
			processMarkdown();
		}
	});
</script>

<svelte:head>
	<!-- <link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css" /> -->
	<link rel="stylesheet" href="https://unpkg.com/easymde@2.18.0/dist/easymde.min.css" />
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css"
	/>
	<script
		src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"
	></script>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/highlight.js/latest/styles/github.min.css"
	/>
</svelte:head>

<div class="artefact-view">
	{#if artefact.title}
		<div class="header-container">
			<div>
				{#if artefact.brief_title}
					<div class="brief-title">Brief: {artefact.brief_title}</div>
				{/if}
				<h4>Title: {artefact.title}</h4>
			</div>
			<span class="artefact-id">id: {artefact.id}</span>
		</div>
	{/if}
	{#if showCoverLetter && artefact.show_cover_letter}
		<div class="cover-letter">
			<h5>Cover Letter</h5>
			{#if artefact.cover_letter}
				<p>{artefact.cover_letter}</p>
			{:else}
				<p class="no-cover-letter">No cover letter available</p>
			{/if}
		</div>
	{/if}
	{#if artefact.content}
		<div class="artefactContent" bind:this={contentElement}>
			<!-- DOMPurify sanitises htmlContent above before it reaches this HTML sink. -->
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html htmlContent}
		</div>
	{/if}

	{#if artefact.files && Array.isArray(artefact.files)}
		{#each artefact.files as file}
			<ProtectedArtefactFile
				artefactId={artefact.artefact_id || artefact.id}
				{file}
				shareKey={artefact.share_key}
				exemplarId={artefact.exemplar_id}
			/>
		{/each}
	{/if}
</div>

<style>
	.artefact-view {
		min-width: 0;
		max-width: 100%;
	}

	.header-container > div {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-2);
	}

	.header-container h4 {
		margin: var(--spacing-0);
	}

	.brief-title {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin-bottom: 0.1rem;
	}

	.artefact-id {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-weight: var(--font-normal);
	}

	.cover-letter {
		border-left: var(--border-width-3) solid var(--color-border-hover);
		background: var(--color-surface);
		padding: var(--spacing-2) var(--spacing-3);
		margin-bottom: var(--spacing-3);
	}

	.cover-letter h5 {
		margin: var(--spacing-0) var(--spacing-0) var(--spacing-1);
		font-size: var(--text-sm);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
	}

	.cover-letter p {
		margin: var(--spacing-0);
		white-space: pre-wrap;
	}

	.no-cover-letter {
		color: var(--color-text-muted);
		font-style: italic;
	}

	.artefactContent {
		background-color: var(--color-surface);
		padding: var(--spacing-2);
		min-width: 0;
		max-width: 100%;
		overflow-wrap: anywhere;
	}

	.artefactContent :global(pre) {
		box-sizing: border-box;
		max-width: 100%;
		overflow-x: auto;
		white-space: pre;
		overflow-wrap: normal;
		font-size: var(--text-sm);
		line-height: 1.5;
	}

	.artefactContent :global(pre code) {
		white-space: inherit;
		font-size: inherit;
	}

	.artefactContent :global(pre:focus-visible) {
		outline: var(--border-width-2) solid var(--color-focus);
		outline-offset: -2px;
	}

	.artefactContent :global(:is(p, ul, ol, h1, h2, h3, h4, h5, h6, blockquote, pre)) {
		margin-bottom: 1em;
	}
</style>
