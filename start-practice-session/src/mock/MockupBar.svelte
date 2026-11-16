<script>
	// The strip across the top of the mockup: what it is, and the scenarios to switch
	// between. Not part of Stars.
	let { title, scenarios = [], scenario = $bindable(), children } = $props();
</script>

<header class="mockup-bar">
	<strong>{title}</strong>
	{#if scenarios.length}
		<label>
			Scenario
			<select bind:value={scenario}>
				{#each scenarios as option (option.id)}
					<option value={option.id}>{option.label}</option>
				{/each}
			</select>
		</label>
	{/if}
	{@render children?.()}
</header>

<style>
	.mockup-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--spacing-4);
		padding: var(--spacing-2) var(--spacing-4);
		background: var(--color-surface-hover);
		border-bottom: var(--border-width-1) dashed var(--color-border);
		font-size: var(--text-sm);
	}
	select {
		margin-left: var(--spacing-2);
		font: inherit;
	}
</style>
