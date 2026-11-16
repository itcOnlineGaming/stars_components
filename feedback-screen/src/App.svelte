<script>
	// Feedback screen: what a learner sees right after answering a practice item.
	import MockupBar from './mock/MockupBar.svelte';
	import ApiCalls from './mock/ApiCalls.svelte';
	import ExemplarPractice from './ExemplarPractice.svelte';
	import ExercisePractice from './ExercisePractice.svelte';

	const scenarios = [
		{ id: 'exemplar', label: 'Exemplar: review, feedback, "are you ready"' },
		{ id: 'exercise', label: 'Exercise: answer and result' }
	];
	let scenario = $state('exemplar');
</script>

<MockupBar title="Feedback screen mockup" {scenarios} bind:scenario />

<main>
	{#key scenario}
		{#if scenario === 'exemplar'}<ExemplarPractice />{:else}<ExercisePractice />{/if}
	{/key}
	<ApiCalls />
</main>

<style>
	main {
		padding: var(--spacing-4);
	}
</style>
