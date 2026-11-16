<script lang="ts">
	import { run } from 'svelte/legacy';

	import type { Exemplar } from '$lib/types.js';
	import Artefact from './ArtefactView.svelte';
	import FlagContentButton from './FlagContentButton.svelte';
	import { Button } from '$ui/components';
	import { sectionHeadingAt } from '$lib/checklistSections';

	interface Props {
		exemplar: Exemplar;
		feedbackComplete?: any;
	}

	let { exemplar, feedbackComplete = () => {} }: Props = $props();

	function cancel() {}

	let combinedChecklist: any[] = $state([]);

	run(() => {
		combinedChecklist = exemplar.checklist.map((c) => ({
			...c,
			correctAnswer: exemplar.authoritative_checklist.find((item) => item.id === c.id)?.answer,
			feedback: exemplar.authoritative_checklist.find((item) => item.id === c.id)?.feedback
		}));
	});
</script>

<section>
	<h1>Feedback</h1>
	<Artefact artefact={exemplar} />

	{#each combinedChecklist as { id, question, correctAnswer, answer, correct, feedback }, i}
		{@const heading = sectionHeadingAt(combinedChecklist, i)}
		{#if heading}
			<h3 class="section-heading">{heading}</h3>
		{/if}
		<div class="checklist-feedback" class:correct>
			<div class="check">{correct ? '✔️' : '❌'}</div>
			<div class="feedback-answer">
				<div class="question">{question}</div>
				<div class="feedback">Feedback: {feedback}</div>
				<div class="answers">
					<div>Your answer:</div>
					<div class="answer">{answer}</div>
					<div class="correct-answer">Correct answer:</div>
					<div class="correct-answer answer">{correctAnswer}</div>
				</div>
				<div class="flag">
					<FlagContentButton
						payload={{
							content_type: 'exemplar',
							content_id: exemplar.id,
							checklist_item_id: id,
							content_version: exemplar.content_version ?? null,
							question,
							learner_answer: answer ?? null,
							shown_answer: correctAnswer ?? null,
							shown_feedback: feedback ?? null
						}}
					/>
				</div>
			</div>
		</div>
	{/each}

	<Button onclick={feedbackComplete}>Done</Button>
	<Button onclick={cancel}>Cancel</Button>
</section>

<style>
	.section-heading {
		margin: var(--spacing-4) 0 var(--spacing-2);
		font-size: var(--text-base);
		color: inherit;
	}

	.feedback-answer {
		display: grid;
		grid-template-columns: 2fr 4fr;
		gap: var(--spacing-2);

		grid-template-areas:
			'question question'
			'answer feedback'
			'flag flag';
	}

	.checklist-feedback {
		border-radius: var(--radius-2xl);
		padding: var(--spacing-2);
		margin: var(--spacing-1);
		display: flex;
		align-items: center;
	}

	.question {
		grid-area: question;
		font-weight: var(--font-bold);
		font-size: var(--text-lg);
	}
	.flag {
		grid-area: flag;
	}

	.feedback {
		grid-area: feedback;
		font-style: italic;
	}

	.answers {
		grid-area: answer;
		display: grid;
		grid-template-columns: 3fr 1fr;
		grid-template-areas: 'your correct';
		background-color: color-mix(in srgb, var(--color-danger) 35%, var(--color-surface-raised));
	}

	.correct .answers {
		background-color: color-mix(in srgb, var(--color-success) 40%, var(--color-surface-raised));
	}

	.answer {
		font-weight: var(--font-bold);
	}

	.check {
		font-size: var(--text-base);
		margin-right: 0.25em;
	}
</style>
