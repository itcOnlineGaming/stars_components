<script>
	// Start practice session: where a learner chooses what to practise. PracticeEntry is the screen
	// the practise-exercises and practise-exemplars pages show before a set starts.
	// Starting navigates away, as in Stars; the mockup then shows where Stars would go.
	import PracticeEntry from '$lib/components/PracticeEntry.svelte';
	import MockupBar from './mock/MockupBar.svelte';
	import ApiCalls from './mock/ApiCalls.svelte';
	import { scenarios } from './mock/scenarios.js';

	const url = new URL(window.location.href);
	let scenarioId = $state(url.searchParams.get('scenario') ?? scenarios[0].id);
	const scenario = $derived(scenarios.find((s) => s.id === scenarioId) ?? scenarios[0]);
	// Keep the scenario in the address, so coming back after "Start practice" returns to it.
	$effect(() => {
		if (url.pathname === '/') history.replaceState(null, '', `/?scenario=${scenarioId}`);
	});
	const left = url.pathname !== '/';
	const settings = [...url.searchParams].filter(([key]) => key !== 'return');
</script>

<MockupBar title="Start practice session mockup" scenarios={left ? [] : scenarios} bind:scenario={scenarioId} />

<main>
	{#if left}
		<section class="mockup-note">
			<h1>The learner has left the choice screen</h1>
			<p>In Stars this opens <code>{url.pathname}</code>{settings.length ? ' with:' : '.'}</p>
			{#if settings.length}
				<dl>
					{#each settings as [key, value]}<dt>{key}</dt><dd>{value}</dd>{/each}
				</dl>
			{/if}
			<p><a href="/?scenario={scenarioId}">Back to the choice screen</a></p>
		</section>
	{:else}
		{#key scenarioId}<PracticeEntry {...scenario.props} />{/key}
	{/if}
	<ApiCalls />
</main>

<style>
	main {
		padding: var(--spacing-4);
	}
	.mockup-note {
		max-width: var(--container-md);
		padding: var(--spacing-6);
	}
	dl {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: var(--spacing-1) var(--spacing-4);
	}
	dt {
		color: var(--color-text-muted);
	}
	dd {
		margin: var(--spacing-0);
	}
</style>
