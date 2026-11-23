<!--
  Card
  ----
  Content container with consistent border, background, and shadow.

  Variants
  --------
  raised  — White/surface-raised background. Default for panels, dialogs, and interactive cards.
  flat    — Surface background (slightly tinted). For sections nested inside a raised surface.

  Padding
  -------
  none  — No padding. Use when children manage their own spacing.
  sm    — Compact. Good for dense UIs or table-like content.
  md    — Standard. Default.
  lg    — Generous. For hero or prominent content areas.

  Shadow
  ------
  none  — No shadow. Flat areas or cards inside other raised surfaces.
  sm    — Subtle lift. Default.
  md    — Moderate lift. Floating panels.
  lg    — Strong lift. Overlaid content.

  Layout
  ------
  block — Children one under another. Default.
  split — The first child (an icon, image or figure) beside the rest, as long as the
          card is at least 30rem wide; in a narrower card they stack, as on a phone.

  A card lays out by the space it has, not the window. It is a size container named
  card, so what is inside it can ask how wide the card is:
  @container card (width < 30rem) { ... }. Its padding shrinks with the column it sits
  in, from md or lg down to sm. As a size container it takes its width from where it
  sits, never from its content, so a card in a shrink-to-fit place (a flex item with
  flex: none, an inline-block) needs a width.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	type Variant = 'raised' | 'flat';
	type Padding = 'none' | 'sm' | 'md' | 'lg';
	type Shadow = 'none' | 'sm' | 'md' | 'lg';
	type Layout = 'block' | 'split';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		variant?: Variant;
		padding?: Padding;
		shadow?: Shadow;
		layout?: Layout;
		children?: Snippet;
	}

	let {
		variant = 'raised',
		padding = 'md',
		shadow = 'sm',
		layout = 'block',
		class: extraClass = '',
		children,
		...rest
	}: Props = $props();
</script>

<div
	class="card card--{variant} card--pad-{padding} card--shadow-{shadow} card--{layout}{extraClass
		? ' ' + extraClass
		: ''}"
	{...rest}
>
	{@render children?.()}
</div>

<style>
	.card {
		container: card / inline-size;
		border-radius: var(--radius-xl);
		border: var(--border-width-1) solid var(--color-border);
	}

	/* ── Variants ─────────────────────────────────── */

	.card--raised {
		background: var(--color-surface-raised);
	}

	.card--flat {
		background: var(--color-surface);
	}

	/* ── Padding ──────────────────────────────────── */

	.card--pad-none {
		padding: var(--spacing-0);
	}

	.card--pad-sm {
		padding: var(--spacing-4);
	}

	/* A percentage padding is a share of the column the card sits in, so a card in a
	   narrow column (or on a phone) is padded as sm, and a wide one in full. */
	.card--pad-md {
		padding: clamp(var(--spacing-4), 5%, var(--spacing-6));
	}

	.card--pad-lg {
		padding: clamp(var(--spacing-4), 6%, var(--spacing-8));
	}

	/* ── Shadow ───────────────────────────────────── */

	.card--shadow-none {
		box-shadow: var(--shadow-none);
	}

	.card--shadow-sm {
		box-shadow: var(--shadow-sm);
	}

	.card--shadow-md {
		box-shadow: var(--shadow-md);
	}

	.card--shadow-lg {
		box-shadow: var(--shadow-lg);
	}

	/* ── Layout ───────────────────────────────────── */

	.card--split {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: var(--spacing-4);
	}

	.card--split > :global(:first-child) {
		flex: none;
	}

	.card--split > :global(:not(:first-child)) {
		flex: 1 1 0;
		min-width: 0;
	}

	/* As specific as the rules above, which it must beat. */
	@container card (width < 30rem) {
		.card--split > :global(:first-child),
		.card--split > :global(:not(:first-child)) {
			flex-basis: 100%;
		}
	}
</style>
