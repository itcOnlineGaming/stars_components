<script>
	// What the component asked the (pretend) server for, newest first. Not part of Stars.
	import { apiLog } from './apiLog.svelte.js';
</script>

<details class="api-calls">
	<summary>API calls ({apiLog.calls.length})</summary>
	{#if apiLog.calls.length === 0}
		<p>None yet.</p>
	{:else}
		<ol>
			{#each apiLog.calls as call, i (apiLog.calls.length - i)}
				<li>
					<code>{call.method} {call.path}</code>
					{#if call.status !== 'ok'}<strong> {call.status}</strong>{/if}
					{#if call.body && Object.keys(call.body).length}
						<pre>{JSON.stringify(call.body, null, 2)}</pre>
					{/if}
				</li>
			{/each}
		</ol>
	{/if}
</details>

<style>
	.api-calls {
		margin-top: var(--spacing-8);
		padding: var(--spacing-3);
		border: var(--border-width-1) dashed var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
	summary {
		cursor: pointer;
	}
	pre {
		margin: var(--spacing-1) var(--spacing-0) var(--spacing-2);
		white-space: pre-wrap;
	}
</style>
