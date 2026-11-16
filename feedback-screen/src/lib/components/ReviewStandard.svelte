<script>
	import { Button } from '$ui/components';
	import { standards, suggestStandard } from '$lib/reviews/standards.js';
	let {
		items = [],
		label = 'Overall standard',
		name,
		value = null,
		readonly = false,
		onchange = () => {}
	} = $props();
	let suggested = $derived(suggestStandard(items));
	let notAnswered = $derived(items.filter((i) => !i.answer).length);
	// With items unanswered the reviewer must choose a standard themselves, so the
	// suggestion is only marked, not preselected: picking it then counts as a choice.
	let selected = $derived(
		value?.selected !== undefined
			? value.selected
			: readonly || !notAnswered
			  ? suggested.suggested
			  : null
	);
</script>

<fieldset class="standard">
	<legend>{label}</legend>
	<p>
		{suggested.yes_count} of {suggested.applicable_count} applicable items Yes{#if notAnswered}
			· {notAnswered} not answered{/if}
	</p>
	<div class="choices">
		{#each standards as text, mark}
			<label class:selected={selected === mark} class="mark-{mark}">
				<input
					type="radio"
					{name}
					value={mark}
					checked={selected === mark}
					disabled={readonly}
					onchange={() => onchange({ selected: mark })}
				/>
				<strong><span>{mark}</span></strong><span>{text}</span>
				{#if !readonly && suggested.suggested === mark}<small>Suggested</small>{/if}
			</label>
		{/each}
	</div>
	{#if selected == null}
		<p>
			{!readonly && notAnswered
				? 'Choose a standard, or answer every item for a suggestion.'
				: 'Unassessed: no applicable answers.'}
		</p>
	{/if}
	{#if !readonly && value != null}
		<Button variant="secondary" type="button" onclick={() => onchange(null)}>Use suggestion</Button>
	{/if}
</fieldset>

<style>
	.standard {
		margin: var(--spacing-4) 0;
		padding: var(--spacing-4);
		max-width: var(--container-md);
		box-sizing: border-box;
		border: var(--border-width-1) solid var(--color-border);
		border-radius: var(--radius-xl);
	}
	legend {
		font-weight: var(--font-bold);
	}
	p {
		margin: var(--spacing-1) 0 var(--spacing-3);
		font-size: var(--text-sm);
	}
	.choices {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: var(--spacing-2);
	}
	.choices label {
		display: flex;
		align-items: center;
		flex-direction: column;
		position: relative;
		gap: var(--spacing-1);
		padding: var(--spacing-2) var(--spacing-1);
		border: var(--border-width-2) solid transparent;
		border-radius: var(--radius-md);
		cursor: pointer;
		text-align: center;
		font-size: var(--text-xs);
	}
	.choices label:focus-within {
		outline: var(--border-width-3) solid var(--color-brand);
		outline-offset: 2px;
	}
	.choices input {
		position: absolute;
		opacity: 0;
		width: var(--border-width-1);
		height: var(--border-width-1);
	}
	strong {
		display: grid;
		place-items: center;
		width: var(--spacing-12);
		height: var(--spacing-12);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-size: var(--text-2xl);
	}
	/* The same grade colours as the Golf Card and Weekly Marks: 0 and 1 red, 2 orange,
	   3 and 4 green, 4 circled as a score under par is on a golf scorecard. */
	.mark-0 strong,
	.mark-1 strong {
		background: var(--color-danger);
		color: var(--color-on-brand);
	}
	.mark-2 strong {
		background: var(--color-warning);
		color: var(--color-text-primary);
	}
	.mark-3 strong,
	.mark-4 strong {
		background: var(--color-success);
		color: var(--color-on-brand);
	}
	.mark-4 strong span {
		display: grid;
		place-items: center;
		box-sizing: border-box;
		inline-size: 1.6em;
		block-size: 1.6em;
		border: var(--border-width-2) solid currentColor;
		border-radius: var(--radius-full);
	}
	.choices .selected {
		border-color: var(--color-text-primary);
		background: var(--color-surface);
	}
	small {
		color: var(--color-brand);
		font-weight: var(--font-bold);
	}
	fieldset > :global(.btn) {
		margin-top: var(--spacing-3);
	}
	@media (width < 640px) {
		.standard {
			padding: var(--spacing-3);
		}
		.choices {
			gap: var(--spacing-0);
		}
		strong {
			width: var(--spacing-8);
			height: var(--spacing-8);
		}
	}
</style>
