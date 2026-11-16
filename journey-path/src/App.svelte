<script>
	// The Stars learner journey page (a learner's view of one journey),
	// cut down to the part this mockup is about: the heading, the locked-step notice and
	// the JourneyPath. The page's loading, retry and milestone popup are left out; what a
	// click would open is shown in a notice instead.
	import { Button } from '$ui/components';
	import JourneyPath from '$lib/components/JourneyPath.svelte';
	import { journeyStepSummary, journeyStepMilestoneProgress } from '$lib/journeyStepSummary.js';
	import MockupBar from './mock/MockupBar.svelte';
	import { scenarios } from './mock/journeys.js';

	let scenarioId = $state('midway');
	const scenario = $derived(scenarios.find((s) => s.id === scenarioId));
	const progressByStep = $derived(scenario.progress);

	// As the page does: merge each step's progress onto it for JourneyPath.
	const pathSteps = $derived(
		scenario.steps.map((step) => ({
			...step,
			status: progressByStep[step.journey_step_id]?.status,
			details: progressByStep[step.journey_step_id]?.details,
			locked: progressByStep[step.journey_step_id]?.locked ?? false,
			locked_by: progressByStep[step.journey_step_id]?.locked_by ?? null
		}))
	);

	let lockedNotice = $state('');
	let opened = $state('');

	function handleActivate(step) {
		if (step.locked) {
			lockedNotice = `"${step.title}" is locked. Complete "${step.locked_by?.title}" to unlock it.`;
			opened = '';
			return;
		}
		lockedNotice = '';
		opened =
			step.step_kind === 'milestone'
				? `In Stars this opens the "${step.title}" requirements popup.`
				: `In Stars this opens "${step.title}".`;
	}

	$effect(() => {
		scenarioId;
		lockedNotice = '';
		opened = '';
	});
</script>

<MockupBar title="Journey path mockup" {scenarios} bind:scenario={scenarioId} />

<div class="journey-container">
	<div class="header">
		<h1>{scenario.journey.title}</h1>
		{#if scenario.journey.description}<p>{scenario.journey.description}</p>{/if}
	</div>

	{#if lockedNotice}
		<p class="locked-notice" role="alert">
			🔒 {lockedNotice}
			<Button variant="secondary" size="sm" type="button" onclick={() => (lockedNotice = '')}
				>Dismiss</Button
			>
		</p>
	{/if}

	<JourneyPath
		steps={pathSteps}
		summary={(step) => journeyStepSummary(step, progressByStep[step.journey_step_id] || {})}
		milestoneProgress={(step) =>
			journeyStepMilestoneProgress(step, progressByStep[step.journey_step_id])}
		onActivate={handleActivate}
	/>

	{#if opened}<p class="mockup-note" role="status">{opened}</p>{/if}
</div>

<style>
	/* From the journey page. */
	.journey-container {
		max-width: var(--container-lg);
		margin: var(--spacing-0) auto;
		padding: var(--spacing-8);
		font-family: var(--font-sans);
	}
	.header {
		margin-bottom: var(--spacing-6);
	}
	.header h1 {
		margin: var(--spacing-0);
	}
	.header p {
		color: var(--color-text-muted);
		margin: var(--spacing-2) var(--spacing-0) var(--spacing-0);
	}
	.locked-notice {
		background: var(--color-surface);
		border-left: var(--border-width-4) solid var(--color-text-muted);
		padding: var(--spacing-3) var(--spacing-4);
		margin-bottom: var(--spacing-4);
	}

	/* The mockup's own. */
	.mockup-note {
		margin-top: var(--spacing-6);
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}
</style>
