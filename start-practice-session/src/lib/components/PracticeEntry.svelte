<script>
	import { Button } from '$ui/components';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { user } from '$lib/user.svelte.js';
	import { getJson, postJson } from '$lib/fetch.js';
	import { flattenSkillAreas, capitaliseWords } from '@stars/admin-exercises';
	import { journeyReturn } from '$lib/exercises/journeyPractice.js';
	import { beginPlannedPractice } from '$lib/plannedPractice.js';
	import { beginJourneyPractice } from '$lib/journeyPracticeSession.js';
	let {
		initialSkillId = null,
		initialSkill = null,
		initialMethod = 'exercise',
		plannedContext = null,
		journeyContext = null
	} = $props();
	let skills = $state([]),
		skillId = $state(''),
		method = $state(initialMethod),
		mode = $state('random');
	let options = $state(null),
		loading = $state(true),
		busy = $state(false),
		error = $state('');
	let request = 0;
	let generation = 0;
	let mounted = $state(false);
	let count = $state(5);
	let permissions = $derived(journeyContext?.assignment.controls ?? {});
	let requirements = $state(null);
	let back = $derived(
		journeyContext
			? { href: `${base}/journeys/v2/${journeyContext.journey}/` }
			: journeyReturn($page.url.searchParams.get('return'), base)
	);
	let size = $derived(journeyContext || plannedContext ? count : method === 'exercise' ? 5 : 3);
	let available = $derived(options?.[method]);
	let insufficient = $derived(
		available && (mode === 'unseen' ? available.unseen : available.total) < size
	);
	onMount(() => {
		mounted = true;
		return () => {
			generation += 1;
		};
	});
	$effect(() => {
		const group = user.current_group_id;
		if (mounted) load(group, ++generation);
	});
	async function load(group, version) {
		loading = true;
		error = '';
		skillId = '';
		mode = 'random';
		try {
			if (journeyContext) {
				const assigned = journeyContext.assignment;
				skills = assigned.skills ?? [{ id: assigned.skill_id, name: assigned.skill_name }];
				skillId = String(assigned.skill_id);
				method = assigned.method;
				mode = assigned.mode;
				count = assigned.count ?? (assigned.method === 'exercise' ? 5 : 3);
				requirements = assigned.requirements;
				return;
			}
			if (plannedContext?.record.started_at) {
				window.location.replace(
					await beginPlannedPractice(plannedContext, plannedContext.record.method)
				);
				return;
			}
			const result = await postJson('/skills/get-skill-masteries', {
				skills: [],
				group_id: group
			});
			if (version !== generation) return;
			skills = flattenSkillAreas(result?.skill_areas ?? [], { preserveNames: true });
			const assignedId = plannedContext?.model.config.skill_id ?? initialSkillId;
			const assignedName = plannedContext?.model.skill_name ?? initialSkill;
			const match = skills.find((s) =>
				assignedId != null
					? String(s.id) === String(assignedId)
					: s.name.toLowerCase() === assignedName?.toLowerCase()
			);
			skillId = String(
				match?.id ?? (assignedId == null && assignedName == null ? skills[0]?.id ?? '' : '')
			);
			if (!skillId)
				error =
					assignedId != null || assignedName != null
						? 'The assigned skill is unavailable in your current class.'
						: 'No skills are available in your current class.';
		} catch (e) {
			if (version === generation) error = String(e);
		} finally {
			if (version === generation) loading = false;
		}
	}
	$effect(() => {
		const id = skillId,
			selectedMethod = method;
		const version = ++request;
		options = null;
		if (!id) return;
		error = '';
		const assigned = journeyContext?.assignment;
		const query = new URLSearchParams();
		if (permissions.skill) query.set('skill_id', id);
		if (permissions.method) query.set('method', selectedMethod);
		if (assigned?.set_sizes) count = assigned.set_sizes[selectedMethod];
		else if (plannedContext) count = selectedMethod === 'exercise' ? 5 : 3;
		getJson(
			assigned?.controls
				? `${journeyContext.endpoint}?${query}`
				: `/practice/options?skill_id=${encodeURIComponent(id)}`
		)
			.then((result) => {
				if (version !== request) return;
				options = result.options ?? result;
				if (result.requirements) requirements = result.requirements;
				if (!journeyContext && !result[selectedMethod]?.unseen && mode === 'unseen')
					mode = 'random';
			})
			.catch((e) => {
				if (version === request) error = String(e);
			});
	});
	async function start() {
		if (!skillId || !available || insufficient || busy) return;
		busy = true;
		error = '';
		try {
			if (journeyContext) {
				const values = { skill_id: Number(skillId), method, mode, count };
				const choices = Object.fromEntries(
					Object.entries(values).filter(([key]) => permissions[key === 'skill_id' ? 'skill' : key])
				);
				window.location.assign(await beginJourneyPractice(journeyContext, choices));
				return;
			}
			if (plannedContext) {
				window.location.assign(await beginPlannedPractice(plannedContext, method, mode, count));
				return;
			}
			const query = new URLSearchParams({ skill_ids: skillId, mode, start: '1' });
			const back = $page.url.searchParams.get('return');
			if (back) query.set('return', back);
			window.location.assign(
				`${base}/${method === 'exercise' ? 'practise-exercises' : 'practise-exemplars'}/?${query}`
			);
		} catch (e) {
			error = String(e);
			busy = false;
		}
	}
</script>

<section class="practice-entry" aria-labelledby="practice-entry-title">
	<h1 id="practice-entry-title">Practice</h1>
	{#if plannedContext}<a
			href={`${base}/journeys/v2/${plannedContext.journey}/practice-plan/${plannedContext.step}/`}
			>← Your practice plan</a
		>{/if}
	{#if !plannedContext && back}<a href={back.href}>← Back to journey</a>{/if}
	{#if requirements}
		<div class="requirements" aria-label="Step requirements">
			{#each Object.entries(requirements) as [name, progress], index}
				{#if index > 0}<strong>or</strong>{/if}
				<p>
					{name === 'exercise' ? 'Exercises' : 'Exemplars'}: {progress.required} required · {progress.completed}
					completed · {progress.remaining} remaining
				</p>
			{/each}
			<p>Complete distinct scored items. Repeating an item does not increase this count.</p>
		</div>
	{/if}
	<label for="practice-skill">Skill</label>
	{#if journeyContext && !permissions.skill}<small>Set by your teacher</small>{/if}
	<select
		id="practice-skill"
		bind:value={skillId}
		disabled={loading || busy || !!plannedContext || (!!journeyContext && !permissions.skill)}
	>
		{#if !skillId}<option value="">Choose a skill</option>{/if}
		{#each skills as skill}<option value={String(skill.id)}>{capitaliseWords(skill.name)}</option
			>{/each}
	</select>
	<label for="practice-type">Practice type</label>
	{#if journeyContext && !permissions.method}<small>Set by your teacher</small>{/if}
	<select
		id="practice-type"
		bind:value={method}
		disabled={loading || busy || (!!journeyContext && !permissions.method)}
	>
		{#each journeyContext?.assignment.allowed_methods ?? [journeyContext?.assignment.method ?? 'exercise', ...(!journeyContext ? ['exemplar'] : [])] as name}
			<option value={name}>{name === 'exercise' ? 'Exercises' : 'Exemplars'}</option>
		{/each}
	</select>
	<label for="practice-mode">Practice mode</label>
	{#if journeyContext && !permissions.mode}<small>Set by your teacher</small>{/if}
	<select
		id="practice-mode"
		bind:value={mode}
		disabled={loading || busy || !available || (!!journeyContext && !permissions.mode)}
	>
		{#each journeyContext?.assignment.allowed_modes ?? (journeyContext ? [mode] : ['random', 'mistakes', 'refresher', ...(available?.unseen > 0 ? ['unseen'] : [])]) as value}
			<option {value}
				>{value === 'unseen'
					? 'Unseen only'
					: value.charAt(0).toUpperCase() + value.slice(1)}</option
			>
		{/each}
	</select>
	{#if journeyContext || plannedContext}
		<label for="practice-count">Items in this set</label>
		{#if permissions.count || plannedContext}
			<input
				id="practice-count"
				type="number"
				min={journeyContext?.assignment.count_bounds.min ?? 1}
				max={journeyContext?.assignment.count_bounds.max ?? 20}
				bind:value={count}
				disabled={loading || busy}
			/>
			<p class="hint">
				Choose a whole number from {journeyContext?.assignment.count_bounds.min ?? 1} to {journeyContext
					?.assignment.count_bounds.max ?? 20}.
			</p>
		{:else}<output id="practice-count">{size} · Set by your teacher</output>{/if}
	{/if}
	<p class="hint">
		{size}
		{method === 'exercise' ? 'exercises' : 'exemplars'} per set.{#if available?.total && available.unseen === 0}
			You have seen all available {method === 'exercise' ? 'exercises' : 'exemplars'}.{/if}
	</p>
	{#if mode === 'unseen'}<p class="hint">
			Practise items you have not attempted before.
		</p>{:else if mode === 'mistakes'}<p class="hint">
			Prioritise recent mistakes, then items you have found difficult.
		</p>{/if}
	{#if insufficient}<p role="status">
			{mode === 'unseen'
				? `Only ${available.unseen} unseen items remain.`
				: `Only ${available.total} eligible items are available.`} This set needs {size}. {journeyContext
				? 'Change an available setting, or contact your teacher.'
				: 'Choose another mode or practice type, or contact your teacher.'}
		</p>{/if}
	{#if error}<p role="alert">{error}</p>{/if}
	<Button
		variant="primary"
		onclick={start}
		disabled={loading ||
			busy ||
			!available ||
			!skillId ||
			insufficient ||
			!Number.isSafeInteger(size) ||
			size < (journeyContext?.assignment.count_bounds?.min ?? 1) ||
			size > (journeyContext?.assignment.count_bounds?.max ?? (plannedContext ? 20 : Infinity))}
		>{busy ? 'Starting…' : loading ? 'Loading…' : 'Start practice'}</Button
	>
</section>

<style>
	.practice-entry {
		max-width: var(--container-md);
		padding: var(--spacing-6);
		display: grid;
		gap: var(--spacing-3);
	}
	h1 {
		margin: 0 0 var(--spacing-3);
	}
	label {
		margin-top: var(--spacing-2);
	}
	select,
	input[type='number'] {
		width: 100%;
		min-height: var(--size-tap-target);
		padding: var(--spacing-3);
		font: inherit;
		border: var(--border-width-1) solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface-raised);
		color: var(--color-text-primary);
	}
	.hint {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}
	:focus-visible {
		outline: var(--border-width-2) solid var(--color-brand);
		outline-offset: 3px;
	}
</style>
