<script>
	// The Stars exemplar practice page,
	// cut down to the review → feedback → "are you ready" sequence for one round. Loading,
	// recovery after a failed save and the journey return link are left out.
	import { Button } from '$ui/components';
	import { postJson } from '$lib/fetch.js';
	import ArtefactView from '$lib/components/ArtefactView.svelte';
	import ArtefactReview from '$lib/components/ArtefactReview.svelte';
	import ExemplarCredits from '$lib/components/ExemplarCredits.svelte';
	import ExemplarFeedback from '$lib/components/ExemplarFeedback.svelte';
	import { exemplars as sample } from './mock/practice.js';

	let exemplars = $state(structuredClone(sample));
	// As on the page, the round counts down: the last exemplar in the list comes first.
	let currentExemplarIndex = $state(sample.length - 1);
	let step = $state(0);
	let saving = $state(false);
	let saveError = $state('');
	const exemplar = $derived(exemplars[currentExemplarIndex]);
	const isLastExercise = $derived(currentExemplarIndex == 0);

	async function exemplarReviewComplete(filledChecklist) {
		if (saving) return;
		saving = true;
		saveError = '';
		try {
			const result = await postJson('/update-learner-model', {
				exemplar_id: exemplar.id,
				checklist: filledChecklist.map(({ id, answer }) => ({ id, answer }))
			});
			const authoritative = new Map(
				exemplar.authoritative_checklist.map((item) => [item.id, item.answer])
			);
			exemplar.checklist = result.submitted_payload.checklist.map((item) => ({
				...filledChecklist.find((c) => c.id === item.id),
				...item,
				correct: item.answer === authoritative.get(item.id)
			}));
			step = 1;
		} catch (e) {
			saveError = String(e);
		} finally {
			saving = false;
		}
	}

	const feedbackComplete = () => (step = 2);

	function next() {
		step = 0;
		saveError = '';
		currentExemplarIndex = currentExemplarIndex - 1;
	}

	// As on the page: after the last exemplar's feedback there is no "are you ready"
	// screen; Stars goes straight on (to the learner's performance page).
	$effect(() => {
		if (step === 2 && isLastExercise) next();
	});

	function restart() {
		exemplars = structuredClone(sample);
		currentExemplarIndex = sample.length - 1;
		step = 0;
	}
</script>

{#if saveError}<p role="alert">{saveError} Your review has not advanced.</p>{/if}
{#if saving}<p role="status">Saving review…</p>{/if}

<div>
	<h1>Practise recognising Good Work</h1>
	<p class="filter-info">Filtering by skills: Pointers</p>
	{#if currentExemplarIndex == -1}
		<h2>You have completed this round of exercises</h2>
		<p class="mockup-note">
			In Stars the learner now goes to their performance page.
			<Button variant="link" onclick={restart}>Start the round again</Button>
		</p>
	{:else}
		<h2>Exercise {exemplars.length - currentExemplarIndex} of {exemplars.length}</h2>
		{#if step == 0}
			{#key exemplar.id}
				<ArtefactView artefact={exemplar} showCoverLetter={false} />
				<ExemplarCredits
					credits={exemplar.credits ? { author: exemplar.credits.author, reviewer: null } : null}
				/>
				<ArtefactReview
					initialChecklist={exemplar.checklist}
					reviewComplete={exemplarReviewComplete}
					showCommentField={false}
				/>
			{/key}
		{:else if step == 1}
			<ExemplarCredits credits={exemplar.credits} />
			<ExemplarFeedback {exemplar} {feedbackComplete} />
		{:else if step == 2}
			<h1>Are you ready for your next review?</h1>
			<Button variant="primary" onclick={next}>Yes</Button>
		{/if}
	{/if}
</div>

<style>
	/* From the exemplar practice page. */
	h1,
	h2 {
		margin-bottom: var(--spacing-0);
	}
	.filter-info {
		background-color: var(--color-brand-surface);
		padding: var(--spacing-3);
		border-radius: var(--radius-sm);
		margin-bottom: var(--spacing-4);
		color: var(--color-brand-hover);
		font-weight: var(--font-medium);
	}

	/* The mockup's own. */
	.mockup-note {
		color: var(--color-text-muted);
	}
</style>
