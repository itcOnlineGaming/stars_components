<script>
	// The Stars exercise practice page,
	// cut down to answering one multiple choice or exact answer exercise and the result
	// shown after it. Model-answer exercises, the round summary, images and the journey
	// return link are left out.
	import { Button } from '$ui/components';
	import { postJson } from '$lib/fetch.js';
	import FlagContentButton from '$lib/components/FlagContentButton.svelte';
	import { capitaliseWords, ExerciseContent } from '@stars/admin-exercises';
	import { exercises } from './mock/practice.js';

	let currentIndex = $state(0);
	let choice = $state(-1);
	let answer = $state('');
	let submitting = $state(false);
	let hasResult = $state(false);
	let formattedResult = $state(null);
	let resultMessage = $state('');
	let results = $state([]);
	let error = $state('');
	const currentExercise = $derived(exercises[currentIndex]);

	async function submitObjectiveAnswer(response) {
		if (submitting || hasResult) return;
		submitting = true;
		error = '';
		try {
			const result = await postJson('/skills/correct-response', {
				id: currentExercise.id,
				response,
				duration: 12
			});
			answer = result.submitted_payload.response;
			hasResult = true;
			resultMessage = result?.message ?? '';
			formattedResult = result?.formatted_result ?? null;
			results = [...results, { correct: Boolean(result?.correct) }];
		} catch (e) {
			error = String(e);
		} finally {
			submitting = false;
		}
	}

	function nextExercise() {
		currentIndex = (currentIndex + 1) % exercises.length;
		choice = -1;
		answer = '';
		hasResult = false;
		formattedResult = null;
		resultMessage = '';
	}
</script>

<div class="exercise-practice-page">
	{#if error}<p class="notice error" role="alert">{error}</p>{/if}
	<section class="exercise">
		<div class="exercise-head">
			<p>Exercise {currentIndex + 1} of {exercises.length}</p>
			<h1>{capitaliseWords(currentExercise.questionType)}</h1>
			<div class="skills">
				{#each currentExercise.skills as skill}
					<span>{capitaliseWords(skill)}</span>
				{/each}
			</div>
		</div>

		<section class="question" aria-label="Question">
			<ExerciseContent
				text={currentExercise.question}
				markdown={currentExercise.richContent?.question ?? null}
			/>
		</section>

		{#if currentExercise.questionType === 'multiple choice'}
			<div class="choices" role="radiogroup" aria-label="Choices">
				{#each currentExercise.responses as response, index}
					<label class:chosen={choice === index}>
						<input type="radio" bind:group={choice} value={index} disabled={hasResult} />
						<ExerciseContent
							text={response}
							markdown={currentExercise.choiceMarkdown?.[index] ?? null}
						/>
					</label>
				{/each}
			</div>
			<Button
				variant="primary"
				onclick={() => submitObjectiveAnswer(currentExercise.responses[choice])}
				disabled={choice === -1 || submitting || hasResult}
			>
				Submit
			</Button>
		{:else}
			<textarea bind:value={answer} rows="6" disabled={hasResult} aria-label="Your answer"
			></textarea>
			<Button
				variant="primary"
				onclick={() => submitObjectiveAnswer(answer)}
				disabled={!answer.trim() || submitting || hasResult}
			>
				Submit
			</Button>
		{/if}

		{#if hasResult}
			<div class="notice result" role="status" aria-label="Result">
				{#if formattedResult}
					<p>
						{results.at(-1)?.correct ? 'Your answer is correct.' : 'Your answer is incorrect.'}
					</p>
					<p>Your response: {answer}</p>
					<p>Correct answer:</p>
					<ExerciseContent markdown={formattedResult.solution} />
					{#if formattedResult.feedback}<p>Feedback:</p>
						<ExerciseContent markdown={formattedResult.feedback} />{/if}
				{:else}{resultMessage}{/if}
			</div>
			<FlagContentButton
				payload={{
					content_type: 'exercise',
					content_id: currentExercise.id,
					content_version: currentExercise.contentVersion ?? null,
					question: currentExercise.question ?? null,
					learner_answer: answer || null,
					shown_answer: formattedResult?.solution ?? resultMessage ?? null,
					shown_feedback: formattedResult?.feedback ?? null
				}}
			/>
			<Button variant="secondary" onclick={nextExercise}>Next Exercise</Button>
		{/if}
	</section>
</div>

<style>
	/* From the exercise practice page. */
	.exercise-practice-page {
		padding: var(--spacing-6);
	}
	.exercise {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-4);
		max-width: var(--container-md);
	}
	h1,
	p {
		margin: var(--spacing-0);
	}
	h1 {
		font-size: var(--text-h1-size);
		font-weight: var(--text-h1-weight);
		line-height: var(--text-h1-leading);
		letter-spacing: var(--text-h1-tracking);
	}
	label {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2);
	}
	textarea {
		width: 100%;
		padding: var(--spacing-3);
		border: var(--border-width-1) solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-surface-raised);
		color: var(--color-text-primary);
		font: inherit;
	}
	.question {
		padding: var(--spacing-4);
		border: var(--border-width-1) solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface-raised);
		white-space: pre-wrap;
	}
	.exercise-head {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2);
	}
	.skills,
	.choices {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2);
	}
	.skills span {
		width: fit-content;
		padding: var(--spacing-1) var(--spacing-2);
		border: var(--border-width-1) solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		font-size: var(--text-sm);
	}
	.choices label {
		flex-direction: row;
		align-items: center;
		padding: var(--spacing-3);
		border: var(--border-width-1) solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-surface-raised);
	}
	.choices label.chosen {
		border-color: var(--color-brand);
		background: var(--color-brand-surface);
	}
	.notice {
		padding: var(--spacing-3);
		border: var(--border-width-1) solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-surface-raised);
		white-space: pre-wrap;
	}
	.notice.error {
		border-color: var(--color-danger);
		background: var(--color-danger-surface);
		color: var(--color-danger-text);
	}
	.notice.result {
		border-color: var(--color-brand);
		background: var(--color-brand-surface);
	}
</style>
