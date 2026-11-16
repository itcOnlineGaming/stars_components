<script lang="ts">
	import { Button } from '$ui/components';

	let {
		steps = [],
		summary,
		milestoneProgress = () => null,
		onActivate,
		onRemove,
		onReorder,
		onAdd
	}: {
		// Steps may optionally carry a caller-populated `status` field (e.g.
		// 'completed'), read only to decide whether to show the done-badge - builder
		// callers never set it, so the badge simply never renders there.
		steps: any[];
		summary: (step: any) => string;
		// Learner-mode only (see journeyStepMilestoneProgress): a milestone step's
		// {done, total} requirement fraction, driving the segmented ring icon. Builder
		// callers omit this - the default returns null and the plain flag icon renders.
		milestoneProgress?: (step: any) => { done: number; total: number } | null;
		// Called on node click - "edit" in builder mode, "launch" in learner mode.
		onActivate: (step: any) => void;
		// Omitting these puts the component in read-only (learner) mode: no remove
		// button, no drag/move-reorder, no trailing "+ Add" node.
		onRemove?: (stepId: number) => void;
		onReorder?: (orderedStepIds: number[]) => void;
		onAdd?: () => void;
	} = $props();

	let draggedStepId = $state<number | null>(null);
	// Which step's gap is the drop target, and which side of that step the dragged
	// item would land on - drives the insertion-line indicator, not a per-node highlight.
	let dragOverStepId = $state<number | null>(null);
	let dragOverSide = $state<'before' | 'after' | null>(null);

	function handleDragStart(stepId: number) {
		if (!onReorder) return;
		draggedStepId = stepId;
	}

	function handleDragOver(event: DragEvent, stepId: number) {
		if (!onReorder) return;
		event.preventDefault();
		if (stepId === draggedStepId) {
			dragOverStepId = null;
			dragOverSide = null;
			return;
		}
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		dragOverStepId = stepId;
		dragOverSide = event.clientX < rect.left + rect.width / 2 ? 'before' : 'after';
	}

	function handleDragLeave() {
		if (!onReorder) return;
		dragOverStepId = null;
		dragOverSide = null;
	}

	function handleDrop(event: DragEvent, dropStepId: number) {
		if (!onReorder) return;
		event.preventDefault();
		const side = dragOverSide;
		dragOverStepId = null;
		dragOverSide = null;
		if (draggedStepId === null || draggedStepId === dropStepId) {
			draggedStepId = null;
			return;
		}
		const ids = steps.map((s) => s.journey_step_id);
		const dragIndex = ids.indexOf(draggedStepId);
		ids.splice(dragIndex, 1);
		// Recompute the target's index after removal, since removing an earlier item
		// shifts every later index down by one.
		let dropIndex = ids.indexOf(dropStepId);
		if (side === 'after') dropIndex += 1;
		ids.splice(dropIndex, 0, draggedStepId);
		draggedStepId = null;
		onReorder(ids);
	}

	function moveStep(index: number, direction: -1 | 1) {
		if (!onReorder) return;
		const targetIndex = index + direction;
		if (targetIndex < 0 || targetIndex >= steps.length) return;
		const ids = steps.map((s) => s.journey_step_id);
		[ids[index], ids[targetIndex]] = [ids[targetIndex], ids[index]];
		onReorder(ids);
	}

	function nodeVariant(step: any): 'milestone' | 'scaffold' | 'default' {
		if (step.step_kind === 'milestone') return 'milestone';
		if (step.step_kind === 'scaffold') return 'scaffold';
		return 'default';
	}

	// One icon per step_kind for the node circle, mirroring the mockup's icon-in-circle
	// pattern (docs/mockups/journey/journey_create_mockup.html: CONTENT_ICON/SCAFFOLD_ICONS).
	const ICONS: Record<string, string> = {
		milestone: '🏁',
		practice: '✏️',
		practice_plan: '📅',
		resource: '📺',
		weekly_marks: '📊',
		golf_card: '⛳',
		view_brief: '📄',
		specify_feedback: '🎯',
		submit_response: '📨',
		self_evaluation: '🔍',
		peer_evaluation: '👥',
		share_work: '🔗',
		read_reviews: '📬',
		peer_review: '👥',
		ai_evaluation: '🤖',
		revision_plan: '📝',
		reflection: '💬',
		scaffold: '🧩'
	};

	function nodeIcon(step: any): string {
		if (step.details?.plan_status?.state === 'off_track') return '⚠';
		return ICONS[step.step_kind] || '●';
	}

	// Segmented donut-ring geometry for the milestone node icon: one stroke-arc per
	// requirement (not one continuous arc for "done" vs "remaining"), so the ring reads
	// at a glance as "N requirements, this many filled" rather than a generic progress
	// ring. Filled/dim coloring is applied per-segment in the template.
	const RING_SIZE = 80;
	const RING_STROKE = 8;
	const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
	const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

	function ringSegments(total: number) {
		const gap = total > 1 ? 3 : 0;
		const step = RING_CIRCUMFERENCE / total;
		const length = Math.max(step - gap, 2);
		return Array.from({ length: total }, (_, i) => ({
			offset: -(i * step),
			length
		}));
	}

	const WARNING_WINDOW_MS = 48 * 60 * 60 * 1000;

	// Due-date badge state for the ring icon: a short date pill plus, once the
	// milestone is still incomplete, either a "due soon" (<48h left) or "missed"
	// (past due) alert glyph. Both go quiet once the milestone is actually done -
	// a due date on a finished milestone isn't a warning.
	function dueStatus(step: any, mp: { done: number; total: number } | null) {
		const dueAt = step.config?.due_at;
		const dueTime = dueAt ? new Date(dueAt).getTime() : NaN;
		if (!mp || Number.isNaN(dueTime)) {
			return { text: '', missed: false, warning: false };
		}
		const isComplete = mp.total > 0 && mp.done >= mp.total;
		const msRemaining = dueTime - Date.now();
		const missed = !isComplete && msRemaining < 0;
		const warning = !isComplete && !missed && msRemaining < WARNING_WINDOW_MS;
		const text = new Date(dueTime).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric'
		});
		return { text, missed, warning };
	}
</script>

<div class="path" role="list" aria-label="Journey steps">
	{#each steps as step, index (step.journey_step_id)}
		<div class="path-item" role="listitem">
			<div
				class="node node-{nodeVariant(step)}"
				class:node-done={step.status === 'completed'}
				class:node-locked={step.locked}
				class:node-attention={step.step_kind === 'read_reviews' &&
					!onRemove &&
					step.status === 'in_progress'}
				class:node-off-track={step.details?.plan_status?.state === 'off_track'}
				role="group"
				draggable={onReorder ? 'true' : 'false'}
				ondragstart={() => handleDragStart(step.journey_step_id)}
				ondragover={(e) => handleDragOver(e, step.journey_step_id)}
				ondragleave={handleDragLeave}
				ondrop={(e) => handleDrop(e, step.journey_step_id)}
			>
				{#if dragOverStepId === step.journey_step_id && dragOverSide === 'before'}
					<div class="drop-indicator drop-indicator-before" aria-hidden="true"></div>
				{/if}
				<button
					type="button"
					class="node-body"
					onclick={() => onActivate(step)}
					aria-disabled={step.locked ? 'true' : undefined}
					title={step.locked
						? `${step.title}\nLocked: complete "${step.locked_by?.title}" first`
						: `${step.title}\n${summary(step)}`}
				>
					{#if step.step_kind === 'milestone' && milestoneProgress(step)}
						{@const mp = milestoneProgress(step)}
						{@const ringComplete = mp.total > 0 && mp.done >= mp.total}
						{@const due = dueStatus(step, mp)}
						<span class="node-icon node-icon-ring" class:ring-complete={ringComplete}>
							<svg
								class="ring-svg"
								viewBox="0 0 {RING_SIZE} {RING_SIZE}"
								width={RING_SIZE}
								height={RING_SIZE}
								aria-hidden="true"
							>
								<g transform="rotate(-90 {RING_SIZE / 2} {RING_SIZE / 2})">
									{#each ringSegments(mp.total) as seg, i}
										<circle
											cx={RING_SIZE / 2}
											cy={RING_SIZE / 2}
											r={RING_RADIUS}
											stroke-width={RING_STROKE}
											fill="none"
											stroke-linecap="round"
											stroke-dasharray="{seg.length} {RING_CIRCUMFERENCE}"
											stroke-dashoffset={seg.offset}
											class:ring-segment-filled={i < mp.done}
											class:ring-segment-dim={i >= mp.done}
										/>
									{/each}
								</g>
							</svg>
							<span class="ring-center-icon" aria-hidden="true">{nodeIcon(step)}</span>
							<span class="ring-pill" class:ring-pill-complete={ringComplete}
								>{mp.done}/{mp.total}</span
							>
							{#if due.text}
								<span class="ring-due-pill" class:ring-due-missed={due.missed}>{due.text}</span>
							{/if}
							{#if due.missed}
								<span
									class="ring-alert ring-alert-missed"
									aria-hidden="true"
									title="Missed due date">❗</span
								>
							{:else if due.warning}
								<span class="ring-alert ring-alert-warning" aria-hidden="true" title="Due soon"
									>⚠️</span
								>
							{/if}
							{#if step.status === 'completed'}
								<span class="node-done-badge" aria-hidden="true">✓</span>
							{/if}
							{#if step.locked}
								<span class="node-lock-badge" aria-hidden="true">🔒</span>
							{/if}
						</span>
					{:else}
						<span class="node-icon">
							{nodeIcon(step)}
							{#if step.status === 'completed'}
								<span class="node-done-badge" aria-hidden="true">✓</span>
							{/if}
							{#if step.locked}
								<span class="node-lock-badge" aria-hidden="true">🔒</span>
							{/if}
							{#if step.step_kind === 'read_reviews' && step.details?.unseen_reviews > 0}
								<span class="node-new-badge">
									<span aria-hidden="true">{step.details.unseen_reviews}</span>
									<span class="visually-hidden"
										>{step.details.unseen_reviews} new {step.details.unseen_reviews === 1
											? 'review'
											: 'reviews'}</span
									>
								</span>
							{/if}
						</span>
					{/if}
					<span class="node-title">{step.title}</span>
					{#if step.details?.plan_status?.state === 'off_track'}
						<strong class="off-track-label">Off track · Fix plan</strong>
						<span class="node-tag"
							>{step.details.sessions_completed ?? 0}/{step.details.sessions_required ?? 0} sessions
							completed</span
						>
					{:else}<span class="node-tag">{summary(step)}</span>{/if}
				</button>
				{#if onRemove}
					<button
						type="button"
						class="node-remove"
						aria-label={`Remove ${step.title}`}
						onclick={() => onRemove(step.journey_step_id)}
					>
						×
					</button>
				{/if}
				{#if onReorder}
					<div class="node-order">
						<Button
							variant="ghost"
							size="sm"
							onclick={() => moveStep(index, -1)}
							disabled={index === 0}
							aria-label={`Move ${step.title} earlier`}>↑</Button
						>
						<Button
							variant="ghost"
							size="sm"
							onclick={() => moveStep(index, 1)}
							disabled={index === steps.length - 1}
							aria-label={`Move ${step.title} later`}>↓</Button
						>
					</div>
				{/if}
				{#if dragOverStepId === step.journey_step_id && dragOverSide === 'after'}
					<div class="drop-indicator drop-indicator-after" aria-hidden="true"></div>
				{/if}
			</div>
			<div class="connector"></div>
		</div>
	{/each}

	{#if onAdd}
		<button type="button" class="node node-add-wrap" onclick={onAdd} aria-label="Add step">
			<span class="node-add-circle">+</span>
			<span class="node-title node-add-label">Add</span>
		</button>
	{/if}
</div>

<style>
	.node-off-track .node-icon {
		outline: var(--border-width-3) solid var(--color-danger-text);
		outline-offset: 4px;
	}
	.off-track-label {
		color: var(--color-danger-text);
		font-size: var(--text-sm);
	}
	.path {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		row-gap: var(--spacing-6);
		gap: var(--spacing-2);
	}

	.path-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
	}

	.node {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 13ch;
	}

	.node-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-0);
		width: 100%;
		border: none;
		background: none;
		cursor: pointer;
		font-family: var(--font-sans);
		padding: var(--spacing-0);
		text-align: center;
	}

	.node-icon {
		position: relative;
		width: var(--spacing-16);
		height: var(--spacing-16);
		border-radius: 50%;
		background: var(--color-brand);
		color: var(--color-on-brand);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-xl);
		box-shadow: var(--shadow-sm);
		flex-shrink: 0;
	}

	.node-milestone .node-icon {
		width: var(--spacing-16);
		height: var(--spacing-16);
		clip-path: polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0% 50%);
		border-radius: 0;
		background: var(--color-warning);
	}

	.node-scaffold .node-icon {
		background: var(--color-brand);
	}

	/* Learner-mode completion badge. Milestones never carry step.status === 'completed'
	   (they show a progress fraction in the tag instead), so this never competes with
	   .node-milestone's gold background above. */
	.node-done .node-icon {
		background: var(--color-success);
	}

	.node-done-badge {
		position: absolute;
		top: -4px;
		right: -4px;
		width: var(--size-icon-sm);
		height: var(--size-icon-sm);
		background: var(--color-surface-raised);
		color: var(--color-success-text);
		border-radius: 50%;
		font-size: var(--text-xs);
		font-weight: var(--font-black);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-sm);
	}

	/* Reviews of the learner's own work exist only as self reviews so far. */
	.node-attention .node-icon {
		background: var(--color-warning);
		color: var(--color-text-primary);
	}

	.node-new-badge {
		position: absolute;
		top: calc(-1 * var(--spacing-1));
		left: calc(-1 * var(--spacing-1));
		min-width: var(--spacing-5);
		height: var(--spacing-5);
		padding: 0 var(--spacing-1);
		border-radius: var(--radius-full);
		background: var(--color-danger);
		color: var(--color-on-brand);
		font-size: var(--text-xs);
		font-weight: var(--font-bold);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-sm);
	}

	/* Locked: unavailable until its prerequisite step is complete. Still clickable so the
	   learner gets a message saying what unlocks it. */
	.node-locked {
		filter: grayscale(1);
		opacity: var(--opacity-disabled);
	}

	.node-locked .node-body {
		cursor: not-allowed;
	}

	.node-lock-badge {
		position: absolute;
		top: -4px;
		right: -4px;
		font-size: var(--text-sm);
		line-height: 1;
	}

	/* Segmented donut-ring milestone icon: one arc per requirement, so the shape itself
	   ("N slices, this many filled") communicates the checklist without reading the
	   pill. Wins over .node-milestone .node-icon's hexagon via the extra class. */
	.node-milestone .node-icon.node-icon-ring {
		width: var(--spacing-20);
		height: var(--spacing-20);
		clip-path: none;
		border-radius: 50%;
		background: var(--color-surface);
		box-shadow: var(--shadow-sm);
		overflow: visible;
	}

	.ring-svg {
		position: absolute;
		inset: 0;
	}

	.ring-segment-filled {
		stroke: var(--color-brand);
		transition: stroke var(--duration-base) var(--ease-standard);
	}

	.ring-complete .ring-segment-filled {
		stroke: var(--color-success-border);
	}

	.ring-segment-dim {
		stroke: var(--color-border);
		opacity: var(--opacity-muted);
	}

	.ring-center-icon {
		position: relative;
		z-index: var(--layer-raised);
		font-size: var(--text-xl);
	}

	.ring-pill {
		position: absolute;
		top: -6px;
		right: -10px;
		z-index: var(--layer-raised);
		background: var(--color-surface-raised);
		border: var(--border-width-1) solid var(--color-border);
		border-radius: var(--radius-full);
		padding: 0 var(--spacing-1);
		font-size: var(--text-xs);
		font-weight: var(--font-bold);
		line-height: 1.4;
		color: var(--color-text-primary);
		box-shadow: var(--shadow-sm);
		white-space: nowrap;
	}

	.ring-pill-complete {
		border-color: var(--color-success-border);
		color: var(--color-success-text);
	}

	.ring-due-pill {
		position: absolute;
		bottom: -6px;
		left: 50%;
		transform: translateX(-50%);
		z-index: var(--layer-raised);
		background: var(--color-surface-raised);
		border: var(--border-width-1) solid var(--color-border);
		border-radius: var(--radius-full);
		padding: 0 var(--spacing-1);
		font-size: var(--text-xs);
		font-weight: var(--font-semibold);
		line-height: 1.4;
		color: var(--color-text-muted);
		box-shadow: var(--shadow-sm);
		white-space: nowrap;
	}

	.ring-due-missed {
		border-color: var(--color-danger);
		color: var(--color-danger-text);
	}

	.ring-alert {
		position: absolute;
		top: -8px;
		left: -8px;
		z-index: var(--layer-raised);
		width: var(--size-icon-md);
		height: var(--size-icon-md);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-xs);
		background: var(--color-surface-raised);
		box-shadow: var(--shadow-sm);
	}

	.ring-alert-warning {
		background: var(--color-warning-surface);
	}

	.ring-alert-missed {
		background: var(--color-danger-surface);
	}

	.node-title {
		margin-top: var(--spacing-2);
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		line-height: 1.2;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		word-break: break-word;
		max-width: 100%;
	}

	.node-tag {
		margin-top: 2px;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.03em;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 100%;
	}

	.node-remove {
		position: absolute;
		top: -4px;
		left: calc(50% + 18px);
		width: var(--size-icon-sm);
		height: var(--size-icon-sm);
		border-radius: 50%;
		border: var(--border-width-1) solid var(--color-danger);
		background: var(--color-surface);
		color: var(--color-danger-text);
		line-height: 1;
		cursor: pointer;
		opacity: 0;
		transition: opacity var(--duration-base) var(--ease-standard);
	}

	/* Shown on hover, on keyboard focus, and always on a touch screen, which has no hover. */
	.node:focus-within .node-remove,
	.node-remove:focus-visible {
		opacity: 1;
	}

	@media (hover: none) {
		.node-remove {
			opacity: 1;
		}
	}

	@media (hover: hover) {
		.node:hover .node-remove {
			opacity: 1;
		}
	}

	.node-order {
		display: flex;
		gap: var(--spacing-1);
		margin-top: var(--spacing-1);
	}

	.connector {
		width: var(--spacing-6);
		height: var(--border-width-2);
		background: var(--color-border);
		flex-shrink: 0;
	}

	.drop-indicator {
		position: absolute;
		top: 0;
		width: var(--border-width-3);
		height: var(--spacing-16);
		background: var(--color-brand);
		border-radius: var(--radius-sm);
		pointer-events: none;
	}

	.drop-indicator-before {
		left: -14px;
	}

	.drop-indicator-after {
		right: -14px;
	}

	.node-add-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		border: none;
		background: none;
		cursor: pointer;
		font-family: var(--font-sans);
		padding: var(--spacing-0);
	}

	.node-add-circle {
		width: var(--spacing-16);
		height: var(--spacing-16);
		border-radius: 50%;
		border: var(--border-width-2) dashed var(--color-brand);
		background: transparent;
		color: var(--color-brand-text);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-xl);
		font-weight: var(--font-medium);
	}

	@media (hover: hover) {
		.node-add-wrap:hover .node-add-circle {
			background: var(--color-surface-raised);
		}
	}

	.node-add-label {
		color: var(--color-brand-text);
	}
</style>
