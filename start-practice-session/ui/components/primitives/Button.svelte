<!--
  Button
  ------
  The one button for every screen in every app. A screen does not style its own
  <button>: it picks a variant and a size here, so a change to a variant reaches every
  button that uses it. A new variant is added only with the designer
  (docs/guides/frontend_design_system.md).

  Variants
  --------
  primary   — The one important action on a screen. Submit, Save, Create, Start.
              Use once per view; brand fill.
  secondary — Supporting actions alongside a primary: Cancel, Back, Edit, View.
              Default variant; surface box with a border.
  danger    — Irreversible or destructive actions: Delete, Remove, Reject.
              Danger fill. Pair with a confirmation step for critical ops.
  reward    — Claiming or celebrating something earned: Claim, Collect, Continue after
              a celebration. Reward fill (gold in both looks).
  ghost     — Standalone navigation that reads like text: ← Back, ← Return to my work.
              No box, no underline at rest; underlines on hover. Zero side padding
              so it aligns with surrounding text.
  link      — Inline text action that lives inside a sentence or label: Login, Learn more.
              No box, permanent underline, normal font weight.

  For buttons that are not actions (agreed with the designer, November 2026):
  tile      — A selectable card: an answer option, a skill or exemplar to pick, a calendar
              cell (sm). Its content starts at the left and may be several lines.
              active is the chosen one; aria-pressed or aria-checked is up to the caller.
  chip      — A filter or one of a set of choices: a period, a view, a tab. Pill shaped;
              active is the chosen one, in the brand fill.
  menu      — An item in a menu or a navigation list. Full width, no box until hovered;
              active is the current page.
  icon      — An icon with no words: close, move, remove, a toggle. Square, quiet until
              hovered; needs an aria-label. At least 44px on a touch screen, as every size.

  Sizes
  -----
  sm  — dense rows: tables, toolbars, cards.
  md  — default.
  On a touch screen every size is at least --size-tap-target (44px) tall and wide.

  States
  ------
  disabled — dimmed, not clickable.
  loading  — a spinner before the label, aria-busy, and not clickable until it ends.
  active   — the pressed or selected one in a group (aria-pressed is up to the caller).

  Focus
  -----
  bind:element gives the caller the <button> itself, to move focus to it:
  <Button bind:element={closeButton} onclick={hide}>Close</Button>, then closeButton.focus().
-->
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	type Variant =
		| 'primary'
		| 'secondary'
		| 'danger'
		| 'reward'
		| 'ghost'
		| 'link'
		| 'tile'
		| 'chip'
		| 'menu'
		| 'icon';
	type Size = 'sm' | 'md';

	interface Props extends HTMLButtonAttributes {
		variant?: Variant;
		size?: Size;
		active?: boolean;
		loading?: boolean;
		element?: HTMLButtonElement | null;
		children?: Snippet;
	}

	let {
		variant = 'secondary',
		size = 'md',
		type = 'button',
		disabled = false,
		active = false,
		loading = false,
		element = $bindable(),
		class: extraClass = '',
		children,
		...rest
	}: Props = $props();
</script>

<button
	bind:this={element}
	{type}
	disabled={disabled || loading}
	aria-busy={loading || undefined}
	class="btn btn--{variant} btn--{size}{active ? ' active' : ''}{loading
		? ' loading'
		: ''}{extraClass ? ' ' + extraClass : ''}"
	{...rest}
>
	{#if loading}<span class="spinner" aria-hidden="true"></span>{/if}
	{@render children?.()}
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-2);
		font-family: var(--font-sans);
		font-weight: var(--font-medium);
		font-size: var(--text-base);
		line-height: var(--leading-tight);
		border-radius: var(--radius-md);
		border: var(--border-width-1) solid transparent;
		cursor: pointer;
		/* Never wider than its container: a long label wraps on a phone rather than
		   pushing the page sideways. A short label stays on one line. */
		max-width: 100%;
		text-align: center;
		text-decoration: none;
		transition:
			background var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard),
			box-shadow var(--duration-fast) var(--ease-standard),
			opacity var(--duration-fast) var(--ease-standard);
	}

	/* ── Sizes ────────────────────────────────────── */

	.btn--sm {
		font-size: var(--text-sm);
		padding: var(--spacing-1) var(--spacing-3);
	}

	.btn--md {
		padding: var(--spacing-2) var(--spacing-4);
	}

	/* A finger needs a bigger target than a pointer. */
	@media (pointer: coarse) {
		.btn {
			min-height: var(--size-tap-target);
			min-width: var(--size-tap-target);
		}
	}

	/* ── Variants ─────────────────────────────────── */

	.btn--primary {
		background: var(--color-brand);
		color: var(--color-on-brand);
		border-color: var(--color-brand);
	}

	@media (hover: hover) {
		.btn--primary:hover:not(:disabled) {
			background: var(--color-brand-hover);
			border-color: var(--color-brand-hover);
		}
	}

	.btn--secondary {
		background: var(--color-surface);
		color: var(--color-text-primary);
		border-color: var(--color-border);
	}

	@media (hover: hover) {
		.btn--secondary:hover:not(:disabled) {
			background: var(--color-surface-hover);
			border-color: var(--color-border-hover);
		}
	}

	.btn--danger {
		background: var(--color-danger);
		color: var(--color-on-brand);
		border-color: var(--color-danger);
	}

	@media (hover: hover) {
		.btn--danger:hover:not(:disabled) {
			background: var(--color-danger-hover);
			border-color: var(--color-danger-hover);
		}
	}

	.btn--reward {
		background: var(--color-reward);
		color: var(--color-on-reward);
		border-color: var(--color-reward);
		font-weight: var(--font-bold);
	}

	@media (hover: hover) {
		.btn--reward:hover:not(:disabled) {
			box-shadow: 0 0 var(--glow-sm) var(--color-reward);
		}
	}

	/* ghost: text-only, used for back-navigation and subtle actions */
	.btn--ghost {
		background: transparent;
		color: var(--color-brand-text);
		border-color: transparent;
		font-weight: var(--font-normal);
		padding-left: var(--spacing-0);
		padding-right: var(--spacing-0);
	}

	@media (hover: hover) {
		.btn--ghost:hover:not(:disabled) {
			color: var(--color-brand-hover);
			text-decoration: underline;
		}
	}

	/* link: inline flow, no box */
	.btn--link {
		background: transparent;
		color: var(--color-brand-text);
		border-color: transparent;
		font-weight: var(--font-normal);
		text-decoration: underline;
		padding-left: var(--spacing-0);
		padding-right: var(--spacing-0);
	}

	@media (hover: hover) {
		.btn--link:hover:not(:disabled) {
			color: var(--color-brand-hover);
		}
	}

	/* tile: a selectable card. Its content lines up at the left and may wrap. */
	.btn--tile {
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
		gap: var(--spacing-1);
		text-align: start;
		background: var(--color-surface-raised);
		color: var(--color-text-primary);
		border-color: var(--color-border);
		border-radius: var(--radius-lg);
		font-weight: var(--font-normal);
		line-height: var(--leading-normal);
	}

	.btn--tile.btn--md {
		padding: var(--spacing-3) var(--spacing-4);
	}

	.btn--tile.btn--sm {
		padding: var(--spacing-2);
	}

	@media (hover: hover) {
		.btn--tile:hover:not(:disabled) {
			border-color: var(--color-brand);
		}
	}

	/* chip: a filter or one of a set of choices, in a pill. */
	.btn--chip {
		background: var(--color-surface);
		color: var(--color-text-primary);
		border-color: var(--color-border);
		border-radius: var(--radius-full);
	}

	@media (hover: hover) {
		.btn--chip:hover:not(:disabled) {
			background: var(--color-surface-hover);
			border-color: var(--color-border-hover);
		}
	}

	/* menu: an item in a menu or navigation list, its words at the left. */
	.btn--menu {
		width: 100%;
		justify-content: flex-start;
		text-align: start;
		background: transparent;
		color: var(--color-text-primary);
		border-color: transparent;
		font-weight: var(--font-normal);
	}

	@media (hover: hover) {
		.btn--menu:hover:not(:disabled) {
			background: var(--color-surface-hover);
		}
	}

	/* icon: an icon with no words, square and quiet until hovered. */
	.btn--icon {
		background: transparent;
		color: var(--color-text-muted);
		border-color: transparent;
		aspect-ratio: 1;
	}

	.btn--icon.btn--md {
		padding: var(--spacing-2);
	}

	.btn--icon.btn--sm {
		padding: var(--spacing-1);
	}

	@media (hover: hover) {
		.btn--icon:hover:not(:disabled) {
			background: var(--color-surface-hover);
			color: var(--color-text-primary);
		}
	}

	/* ── States ───────────────────────────────────── */

	.btn:disabled {
		opacity: var(--opacity-disabled);
		cursor: not-allowed;
	}

	.btn.loading {
		cursor: progress;
	}

	/* The selected one of a group, such as a Grid / List view picker. */
	.btn--secondary.active {
		background: var(--color-brand-surface);
		border-color: var(--color-brand);
		color: var(--color-brand-text);
	}

	/* The chosen tile, chip, menu item (the current page) or toggled icon. */
	.btn--tile.active {
		background: var(--color-brand-surface);
		border-color: var(--color-brand);
		box-shadow: 0 0 0 var(--border-width-1) var(--color-brand);
	}

	.btn--chip.active {
		background: var(--color-brand);
		border-color: var(--color-brand);
		color: var(--color-on-brand);
	}

	.btn--menu.active,
	.btn--icon.active {
		background: var(--color-brand-surface);
		color: var(--color-brand-text);
	}

	.btn:focus-visible {
		outline: var(--border-width-2) solid var(--color-focus);
		outline-offset: var(--border-width-2);
	}

	.spinner {
		width: 1em;
		height: 1em;
		flex-shrink: 0;
		border: var(--border-width-2) solid currentColor;
		border-right-color: transparent;
		border-radius: var(--radius-full);
		animation: btn-spin var(--duration-long) var(--ease-linear) infinite;
	}

	@keyframes btn-spin {
		to {
			transform: rotate(1turn);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation: none;
			border-right-color: currentColor;
			opacity: var(--opacity-muted);
		}
	}
</style>
