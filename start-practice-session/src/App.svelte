<script>
	// Start practice session: where a learner chooses what to practise. PracticeEntry is the screen
	// the practise-exercises and practise-exemplars pages show before a set starts.
	// Starting navigates away, as in Stars; src/routes/[...path] then shows where Stars would go.
	import { replaceState } from '$app/navigation';
	import PracticeEntry from '$lib/components/PracticeEntry.svelte';
	import MockupBar from './mock/MockupBar.svelte';
	import ApiCalls from './mock/ApiCalls.svelte';
	import { scenarios } from './mock/scenarios.js';

	const url = new URL(window.location.href);
	let scenarioId = $state(url.searchParams.get('scenario') ?? scenarios[0].id);
	const scenario = $derived(scenarios.find((s) => s.id === scenarioId) ?? scenarios[0]);
	// Keep the scenario in the address, so coming back after "Start practice" returns to it.
	// Only the query changes, so a version at /b stays at /b. Nothing is written until the
	// choice differs from the address, as SvelteKit allows no replaceState while it starts.
	$effect(() => {
		const inAddress = new URLSearchParams(location.search).get('scenario') ?? scenarios[0].id;
		if (scenarioId !== inAddress) replaceState(`?scenario=${scenarioId}`, {});
	});
</script>

<MockupBar title="Start practice session mockup" {scenarios} bind:scenario={scenarioId} />

<main>
	{#key scenarioId}<PracticeEntry {...scenario.props} />{/key}
	<ApiCalls />
</main>

<style>
	main {
		padding: var(--spacing-4);
	}
</style>
