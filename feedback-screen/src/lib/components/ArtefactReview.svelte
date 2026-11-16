<script>
	import { YES, NO, NA } from '$lib/constants.js';
	import { Button, Modal } from '$ui/components';
	import { slide } from 'svelte/transition';
	import { tick } from 'svelte';
	import ReviewStandard from './ReviewStandard.svelte';
	import { sectionHeadingAt } from '$lib/checklistSections';

	let {
		initialChecklist = [],
		reviewId = crypto.randomUUID(), // Generate a unique ID for this review instance incase not provided
		reviewComplete = null,
		isReadOnly = false,
		showCommentField = true,
		coverLetter = null,
		overall_comment = null,
		standards = null,
		submitLabel = 'Artefact Review Complete',
		onCancel = null
	} = $props();

	let checklist = $state(
		initialChecklist.map((item) => ({
			...item
		}))
	);

	$inspect(checklist, 'checklist in ArtefactReview');

	// A "No" with no reason gives the author nothing to act on, so it gets extra friction:
	// the comment box stays open with a warning, and submitting asks for confirmation.
	const missingReason = (item) =>
		showCommentField && item.status == 'active' && item.answer === NO && !item.feedback?.trim();

	let unjustifiedNos = $derived(checklist.filter(missingReason));
	const unfilled = (item) => item.answer === undefined || item.answer === null || item.answer == '';
	// A reviewer may skip items when they choose the overall standard themselves.
	let unanswered = $derived(checklist.filter((c) => c.status == 'active' && unfilled(c)));
	let confirmingUnjustified = $state(false);
	// Editing a saved review starts from its standard; "Use suggestion" still lets it go.
	const savedStandard =
		!isReadOnly && standards?.provenance === 'reviewer' && standards.overall?.selected != null
			? { selected: standards.overall.selected }
			: undefined;
	/** @type {Record<string, any>} */
	let choices = $state(savedStandard ? { overall: savedStandard } : {});
	let standardChosen = $derived(choices.overall?.selected != null);
	let standardError = $state('');
	let submitting = $state(false);
	function standardsPayload() {
		return { overall: choices.overall || {} };
	}

	async function submitAnswers() {
		if ((unanswered.length > 0 || unjustifiedNos.length > 0) && !confirmingUnjustified) {
			confirmingUnjustified = true;
			return;
		}
		confirmingUnjustified = false;
		standardError = '';
		console.log(checklist);
		submitting = true;
		try {
			await reviewComplete(checklist, overallComment, standardsPayload());
		} catch (error) {
			standardError = error.message || 'Could not save this review. Your answers are retained.';
		} finally {
			submitting = false;
		} // pass-back instead of two-way binding which caused a bug to circular reactivity
	}

	async function goBack() {
		confirmingUnjustified = false;
		// Closing the dialog hands focus back to the submit button, so move it only after.
		await tick();
		const skipped = unanswered[0];
		if (skipped) {
			const i = checklist.findIndex((c) => c.id === skipped.id);
			document.getElementsByName(`${checklistItemName(skipped.id)}-${i}`)[0]?.focus();
			return;
		}
		const first = unjustifiedNos[0];
		if (first) document.getElementById(first.id.toString())?.focus();
	}

	const placeholderFor = (answer) => {
		if (answer === YES) return 'Optional: add a comment...';
		if (answer === NO) return 'Strongly recommended: explain why this is not met...';
		if (answer === NA) return 'Explain why this does not apply...';
		return 'Elaborate on your evaluation...';
	};

	// "Not Applicable" should rarely be chosen, so it sits behind a per-item "more options" toggle.
	// It stays visible whenever it is already the answer, so a selection is never hidden.
	let naRevealed = $state({});
	const showNA = (item) => isReadOnly || item.answer === NA || naRevealed[item.id];

	const randomFillForTestUsers = () => {
		checklist = checklist.map((c) => ({
			...c,
			answer: Math.random() > 0.5 ? YES : NO
		}));
	};

	let checklistNotSelected = $state(true);

	$effect(() => {
		console.log('checklist', checklist);
		checklistNotSelected = checklist.some((c) => unfilled(c) && c.status == 'active');
	});

	let overallComment = $state(isReadOnly ? '' : overall_comment ?? '');

	let current_focus = $state(null);

	const radioClick = (e, id) => {
		current_focus = id;
		if (isReadOnly) e.preventDefault();
		console.log('radioClick', id);
		console.log('current_focus', current_focus);

		const radio = e.currentTarget;
		// Autofocus the textarea after a brief delay to allow it to render
		setTimeout(() => {
			// Not if another item has been clicked since, or focus has moved anywhere else
			// (the standard, the overall comment): it would jump here and what is being
			// typed there would land in this item's box. Safari does not focus a clicked
			// radio, so focus still on the page itself counts as not moved.
			if (current_focus !== id) return;
			const active = document.activeElement;
			if (active && active !== radio && active !== document.body) return;
			const textarea = document.getElementById(id.toString());
			if (textarea) {
				textarea.focus();
			}
		}, 100);
	};

	function autoresize() {
		this.style.height = 'auto'; // Reset the height
		this.style.height = this.scrollHeight + 'px'; // Set the height
	}

	const checklistItemName = (id) => {
		return `checklist-${reviewId}-${id}`;
	};
</script>

<div>
	{#if coverLetter !== null}
		<div class="cover-letter">
			<h5>Cover Letter</h5>
			{#if coverLetter}
				<p>{coverLetter}</p>
			{:else}
				<p class="no-cover-letter">No cover letter available</p>
			{/if}
		</div>
	{/if}
	<ul>
		{#each checklist as { id, question, status }, i (id)}
			{@const heading = sectionHeadingAt(
				checklist,
				i,
				(c) => c.status == 'active' || isReadOnly == true
			)}
			{#if heading}
				<li class="section-heading"><h3>{heading}</h3></li>
			{/if}
			<!-- {#if true} -->
			<!-- {artefact_feedback_id}-{answer} - {id} - {question} -->

			{#if status == 'active' || isReadOnly == true}
				<li class={isReadOnly ? '' : 'hide'}>
					<div class="question">
						<div>
							{question}
							{#if isReadOnly && unfilled(checklist[i])}<span class="not-answered"
									>Not answered</span
								>{/if}
						</div>
						<div class="radios">
							<label>
								<input
									type="radio"
									bind:group={checklist[i].answer}
									value={YES}
									onclick={(e) => radioClick(e, id)}
									name={`${checklistItemName(id)}-${i}`}
									disabled={isReadOnly}
								/> Yes
							</label>
							<label>
								<input
									type="radio"
									bind:group={checklist[i].answer}
									value={NO}
									onclick={(e) => radioClick(e, id)}
									name={`${checklistItemName(id)}-${i}`}
									disabled={isReadOnly}
								/>
								No
							</label>
							{#if showNA(checklist[i])}
								<label>
									<input
										type="radio"
										bind:group={checklist[i].answer}
										value={NA}
										onclick={(e) => radioClick(e, id)}
										name={`${checklistItemName(id)}-${i}`}
										disabled={isReadOnly}
									/>
									Not Applicable
								</label>
							{:else}
								<Button
									variant="icon"
									size="sm"
									class="more-options"
									aria-label="More options"
									title="More options"
									onclick={() => (naRevealed[id] = true)}>&hellip;</Button
								>
							{/if}
						</div>
					</div>
					{#if showCommentField}
						{#if isReadOnly}
							{#if checklist[i].feedback}
								<div class="feedback">{checklist[i].feedback}</div>
							{/if}
						{:else if checklist[i].feedback || current_focus == id || checklist[i].answer === NO}
							<textarea
								in:slide={{ duration: 500 }}
								id={id.toString()}
								class:needs-reason={missingReason(checklist[i])}
								bind:value={checklist[i].feedback}
								placeholder={placeholderFor(checklist[i].answer)}
								oninput={autoresize}
							></textarea>
							{#if missingReason(checklist[i])}
								<p class="reason-warning">
									A "No" without a reason gives the author nothing to act on. Please say what is
									missing.
								</p>
							{/if}
						{/if}
					{/if}
				</li>
			{/if}
		{/each}
	</ul>
	{#if showCommentField}
		{#if isReadOnly && standards && !standards.overall}
			<p>Standard unavailable</p>
		{:else}
			<ReviewStandard
				items={checklist.filter((i) => isReadOnly || i.status === 'active')}
				name={`standard-${reviewId}-overall`}
				readonly={isReadOnly}
				value={isReadOnly ? standards?.overall : choices.overall}
				onchange={(value) => (choices = { ...choices, overall: value })}
			/>
		{/if}
	{/if}
	{#if standardError}<p role="alert">{standardError}</p>{/if}

	<div class="overall-comment-section">
		{#if isReadOnly}
			{#if overall_comment}
				<label for="overall-comment-{reviewId}">Overall Comment </label>
				<div class="overall-comment-display">{overall_comment}</div>
			{:else}
				<label for="overall-comment-{reviewId}">No overall comment provided. </label>
			{/if}
		{:else}
			<label for="overall-comment-{reviewId}"
				>Overall Comment <span class="optional-label">(optional)</span></label
			>
			<textarea
				id="overall-comment-{reviewId}"
				bind:value={overallComment}
				placeholder="Add an overall comment about this artefact..."
				oninput={autoresize}
				class="overall-comment-textarea"
			></textarea>
		{/if}
	</div>

	{#if reviewComplete}
		<Button
			onclick={submitAnswers}
			disabled={(checklistNotSelected && !standardChosen) || submitting}>{submitLabel}</Button
		>
		{#if onCancel}
			<Button onclick={onCancel}>Cancel</Button>
		{/if}
		{#if checklistNotSelected && !standardChosen && showCommentField}
			<p class="submit-hint">Answer every item, or choose an overall standard.</p>
		{/if}
		{#if document.location.hostname === 'localhost'}
			<Button onclick={randomFillForTestUsers}>Fill Randomly (localhost only)</Button>
		{/if}
	{/if}

	<Modal
		isOpen={confirmingUnjustified}
		title="Some items are incomplete"
		size="sm"
		onClose={() => (confirmingUnjustified = false)}
	>
		{#if unanswered.length > 0}
			<p>You did not answer {unanswered.length === 1 ? 'this item' : 'these items'}:</p>
			<ul class="unjustified-list" aria-label="Unanswered items">
				{#each unanswered as item (item.id)}
					<li>{item.question}</li>
				{/each}
			</ul>
		{/if}
		{#if unjustifiedNos.length > 0}
			<p>
				You answered "No" to {unjustifiedNos.length === 1 ? 'this item' : 'these items'} without saying
				why:
			</p>
			<ul class="unjustified-list" aria-label="Items without a reason">
				{#each unjustifiedNos as item (item.id)}
					<li>{item.question}</li>
				{/each}
			</ul>
		{/if}
		<p>Answers and reasons help the author know what to improve.</p>
		{#snippet footer()}
			<Button onclick={submitAnswers}>Submit anyway</Button>
			<Button variant="primary" onclick={goBack}
				>{unanswered.length > 0 ? 'Go back' : 'Add reasons'}</Button
			>
		{/snippet}
	</Modal>
</div>

<style>
	.section-heading {
		list-style: none;
	}

	.section-heading h3 {
		margin: var(--spacing-4) 0 var(--spacing-2);
		font-size: var(--text-base);
		color: inherit;
	}

	.cover-letter {
		border-left: var(--border-width-3) solid var(--color-border-hover);
		background: var(--color-surface);
		padding: var(--spacing-2) var(--spacing-3);
		margin-bottom: var(--spacing-4);
	}

	.cover-letter h5 {
		margin: var(--spacing-0) var(--spacing-0) var(--spacing-1);
		font-size: var(--text-sm);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
	}

	.cover-letter p {
		margin: var(--spacing-0);
		white-space: pre-wrap;
	}

	.no-cover-letter {
		color: var(--color-text-muted);
		font-style: italic;
	}

	.radios {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
	}
	.radios label {
		cursor: pointer;
		margin-left: 2em;
		background-color: var(--color-surface-hover);
	}

	li {
		margin-bottom: 1em;
	}

	textarea {
		width: 80%; /* Increased from 50% */
		min-height: 5em; /* Increased from 2em */
		overflow-y: hidden; /* Hide vertical scrollbar */
		resize: none; /*Disable manual resizing */
		height: auto;
		border: var(--border-width-3) solid var(--color-warning); /* Yellow border */
		border-radius: var(--radius-md);
		padding: var(--spacing-3);
		font-size: var(--text-sm);
		line-height: 1.5;
		transition: border-color var(--duration-base) var(--ease-standard);
	}

	textarea:focus {
		outline: none;
		border-color: var(--color-warning);
		box-shadow: var(--shadow-focus);
	}

	.radios :global(.more-options) {
		margin-left: 1.5em;
	}

	textarea.needs-reason {
		border-color: var(--color-warning);
		background-color: var(--color-warning-surface);
	}

	.reason-warning {
		margin: var(--spacing-1) var(--spacing-0) var(--spacing-0);
		color: var(--color-warning-text);
		font-size: var(--text-sm);
	}

	.not-answered {
		margin-left: var(--spacing-2);
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		font-style: italic;
	}

	.submit-hint {
		margin: var(--spacing-1) var(--spacing-0) var(--spacing-0);
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.unjustified-list {
		margin: var(--spacing-2) var(--spacing-0);
		padding-left: var(--spacing-6);
		list-style: disc;
	}

	.feedback {
		width: 50%;
		background-color: var(--color-surface-raised);
		padding: var(--spacing-1);
		border-width: var(--border-width-1);

		border-style: solid;
	}
	.question {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	@media (width < 640px) {
		.question {
			flex-direction: column;
			align-items: stretch;
			gap: var(--spacing-2);
		}

		.radios {
			flex-wrap: wrap;
			justify-content: flex-start;
			gap: var(--spacing-3);
		}

		.radios label {
			display: inline-flex;
			align-items: center;
			gap: var(--spacing-1);
			margin-left: var(--spacing-0);
		}

		.radios :global(.more-options) {
			margin-left: var(--spacing-0);
		}
	}

	.overall-comment-section {
		margin-top: var(--spacing-6);
	}

	.overall-comment-section label {
		display: block;
		font-weight: var(--font-semibold);
		margin-bottom: var(--spacing-2);
	}

	.optional-label {
		font-weight: var(--font-normal);
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.overall-comment-textarea {
		width: 100%;
	}

	.overall-comment-display {
		background-color: var(--color-surface-raised);
		padding: var(--spacing-2);
		border: var(--border-width-1) solid var(--color-border);
		border-radius: var(--radius-sm);
		white-space: pre-wrap;
	}
</style>
