<!--
  Lets a learner flag an answer or feedback they believe is wrong. The payload
  identifies the content and snapshots what the learner saw; this component adds
  the learner's reason and posts it to /content-flags.
-->
<script lang="ts" module>
	export interface FlagPayload {
		content_type: 'exercise' | 'exemplar' | 'review';
		content_id: number;
		checklist_item_id?: number | null;
		content_version?: string | null;
		question?: string | null;
		learner_answer?: string | null;
		shown_answer?: string | null;
		shown_feedback?: string | null;
	}
</script>

<script lang="ts">
	import { postJson } from '$lib/fetch.js';
	import { Button } from '$ui/components';

	interface Props {
		payload: FlagPayload;
		/** Injected in stories and tests; defaults to the real API. */
		post?: (api: string, data: object) => Promise<any>;
	}

	let { payload, post = postJson }: Props = $props();

	const MAX_REASON = 2000;
	const uid = Math.random().toString(36).slice(2);

	let open = $state(false);
	let reason = $state('');
	let sending = $state(false);
	let sent = $state(false);
	let error = $state('');

	async function submit() {
		if (!reason.trim() || sending) return;
		sending = true;
		error = '';
		try {
			const result = await post('/content-flags', { ...payload, reason: reason.trim() });
			// request() resolves to null on a 404 instead of throwing.
			if (!result?.flag) throw new Error('The flag could not be saved.');
			sent = true;
			open = false;
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			sending = false;
		}
	}

	function cancel() {
		open = false;
		reason = '';
		error = '';
	}
</script>

<div class="flag-content">
	{#if sent}
		<p class="flagged" role="status">Flagged. A teacher will review it.</p>
	{:else if !open}
		<Button variant="link" size="sm" onclick={() => (open = true)}>Flag as incorrect</Button>
	{:else}
		<div class="flag-form">
			<label for="flag-reason-{uid}">Why is this wrong?</label>
			<textarea
				id="flag-reason-{uid}"
				bind:value={reason}
				rows="3"
				maxlength={MAX_REASON}
				disabled={sending}
			></textarea>
			{#if error}<p class="error" role="alert">{error}</p>{/if}
			<div class="actions">
				<Button variant="primary" size="sm" onclick={submit} disabled={!reason.trim() || sending}>
					{sending ? 'Sending…' : 'Send flag'}
				</Button>
				<Button size="sm" onclick={cancel} disabled={sending}>Cancel</Button>
			</div>
		</div>
	{/if}
</div>

<style>
	.flag-content {
		margin-top: var(--spacing-2);
	}

	.flag-form {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2);
		max-width: var(--container-sm);
	}

	.flag-form label {
		font-weight: var(--font-medium);
	}

	textarea {
		width: 100%;
		font: inherit;
		padding: var(--spacing-2);
		border-radius: var(--radius-sm);
	}

	.actions {
		display: flex;
		gap: var(--spacing-2);
	}

	.flagged {
		font-style: italic;
		margin: 0;
	}

	.error {
		color: var(--color-danger-text);
		margin: 0;
	}
</style>
