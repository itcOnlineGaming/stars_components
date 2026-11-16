<script>
	import { Button } from '$ui/components';
	import { onDestroy } from 'svelte';
	import { getBlob } from '$lib/fetch.js';
	let { artefactId, file, shareKey = null, exemplarId = null } = $props();
	let url = $state('');
	let loading = $state(false);
	let error = $state('');
	let active = true;
	let media = $derived(/^(image|audio|video)\//.test(file.fileType || ''));
	async function load() {
		loading = true;
		error = '';
		try {
			const blob = await getBlob(
				`/downloads/${
					exemplarId ? 'exemplars/' + exemplarId : 'artefacts/' + artefactId
				}/${encodeURIComponent(file.filename || file.name)}${
					shareKey ? '?share_key=' + encodeURIComponent(shareKey) : ''
				}`
			);
			if (!active || !blob) return;
			if (url) URL.revokeObjectURL(url);
			url = URL.createObjectURL(blob);
			if (!media) {
				const link = document.createElement('a');
				link.href = url;
				link.download = file.filename || file.name;
				link.click();
			}
		} catch (e) {
			if (active) error = e.message || 'Could not load this file.';
		} finally {
			if (active) loading = false;
		}
	}
	onDestroy(() => {
		active = false;
		if (url) URL.revokeObjectURL(url);
	});
</script>

<div class="protected-file">
	<Button variant="secondary" disabled={loading} onclick={load}
		>{loading
			? 'Loading…'
			: media
			  ? 'Load protected preview: ' + file.name
			  : 'Download ' + file.name}</Button
	>
	{#if error}<p role="alert">{error}</p>{/if}
	{#if url && media}
		{#if file.fileType.startsWith('image')}<img src={url} alt={file.name} />
		{:else if file.fileType.startsWith('audio')}<audio controls src={url}></audio>
		{:else}<!-- svelte-ignore a11y_media_has_caption --><video controls src={url}></video>{/if}
	{/if}
</div>

<style>
	.protected-file {
		margin: var(--spacing-4) 0;
	}
	img,
	video {
		display: block;
		max-width: 100%;
		margin-top: var(--spacing-2);
	}
</style>
