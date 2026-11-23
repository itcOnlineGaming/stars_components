<!--
  NavMenu
  -------
  The one navigation pattern for a narrow screen, in every app (agreed with the designer,
  November 2026): a menu button that opens a full-height panel listing every destination.
  The panel is the shared Modal on its side, so the page behind is inert, Tab stays
  inside, Escape closes it and focus goes back to the button.

  Put the destinations in as links (<a href>) or Buttons; a heading (<h3>) above a group
  names it. Choosing one closes the menu. Mark the current page with aria-current="page".

  Usage:
    <NavMenu>
      <a href="#view-home" aria-current="page">Home</a>
      <h3>Help</h3>
      <a href="#view-help">Student help</a>
    </NavMenu>

  Other attributes (class, data-tour) go on the menu button. modal={false} opens it
  without making the page inert, for a guided tour that points into it.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Menu } from '@lucide/svelte';
	import { ICON_SIZE } from '../../icons.js';
	import Button from './Button.svelte';
	import Modal from './Modal.svelte';

	interface Props {
		/** The menu button's name, and the panel's title. */
		label?: string;
		open?: boolean;
		/** See Modal: false while a guided tour needs to reach past it. */
		modal?: boolean;
		children?: Snippet;
		[key: string]: unknown;
	}

	let {
		label = 'Menu',
		open = $bindable(false),
		modal = true,
		children,
		...rest
	}: Props = $props();

	// Any link or button inside takes the person somewhere: the menu has done its job.
	function closeOnChoice(event: MouseEvent) {
		if ((event.target as Element | null)?.closest('a, button')) open = false;
	}
</script>

<Button
	variant="icon"
	aria-label={label}
	aria-haspopup="dialog"
	aria-expanded={open}
	onclick={() => (open = true)}
	{...rest}><Menu size={ICON_SIZE.md} aria-hidden="true" /></Button
>

<Modal isOpen={open} title={label} onClose={() => (open = false)} placement="side" {modal}>
	<!-- A click here is only ever on a destination, which closes the menu. -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- Only while open, so a page has one set of its links, not two. -->
	{#if open}
		<nav class="nav-menu" aria-label={label} onclick={closeOnChoice}>
			{@render children?.()}
		</nav>
	{/if}
</Modal>

<style>
	.nav-menu {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
	}

	/* The destinations, links or Buttons, one to a line. */
	.nav-menu :global(a) {
		display: flex;
		align-items: center;
		min-height: var(--size-tap-target);
		padding: var(--spacing-2) var(--spacing-3);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		text-decoration: none;
	}

	@media (hover: hover) {
		.nav-menu :global(a:hover) {
			background: var(--color-surface-hover);
		}
	}

	.nav-menu :global(a[aria-current='page']) {
		background: var(--color-brand-surface);
		color: var(--color-brand-text);
		font-weight: var(--font-semibold);
	}

	.nav-menu :global(a:focus-visible) {
		outline: var(--border-width-2) solid var(--color-focus);
		outline-offset: var(--border-width-2);
	}

	/* A group's name, above its destinations. */
	.nav-menu :global(h3) {
		margin: var(--spacing-3) 0 var(--spacing-1);
		padding: 0 var(--spacing-3);
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		font-weight: var(--font-semibold);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
</style>
