<!--
  Modal
  -----
  Accessible dialog built on the native <dialog> element, with Tab kept inside it.
  isOpen is the one truth about whether it shows. Escape, a click on the backdrop and
  the close button each ask onClose, and the dialog closes only when the caller sets
  isOpen to false; then focus goes back to what opened it.

  On a phone (below 640px) every size fills the screen, as the designer chose: the title
  at the top, the content scrolling, the actions fixed at the bottom. While it is open it
  follows the visual viewport, so the on-screen keyboard never covers the actions.

  Sizes
  -----
  sm   — 30rem (--container-dialog). Confirmations, alerts, short forms.
  md   — 40rem (--container-sm). Default. Standard dialogs, moderate content.
  lg   — 60rem (--container-lg). Complex forms, multi-step flows.
  xl   — 75rem (--container-xl). Wide content — data tables, skill selectors.

  Options
  -------
  dismissible — false for a dialog that must be answered: no close button, and
                Escape and the backdrop do nothing.
  closeLabel  — the close button's accessible name ("Close" by default).
  returnFocusTo — where focus goes when it closes, if not to what had focus when
                it opened.
  placement   — "center" (default), or "side": a full-height panel at the start edge,
                as the navigation menu opens (NavMenu).
  modal       — false opens it without making the page behind inert, under anything on
                a higher layer: for a guided tour that points into it. No backdrop, and
                Tab is not kept inside; Escape and the close button still close it.

  The body is a size container named modal, so its content lays out by the dialog's
  width: @container modal (width < 30rem) { ... }.

  Snippets
  --------
  children  — Body content. Rendered in the scrollable middle section.
  footer    — Optional. Rendered in a right-aligned footer bar. Use for action buttons.
              If omitted, no footer renders.
-->
<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { X } from '@lucide/svelte';
	import { ICON_SIZE } from '../../icons.js';
	import Button from './Button.svelte';

	type Size = 'sm' | 'md' | 'lg' | 'xl';

	interface Props {
		isOpen: boolean;
		title: string;
		onClose: () => void;
		size?: Size;
		dismissible?: boolean;
		closeLabel?: string;
		returnFocusTo?: HTMLElement | null;
		placement?: 'center' | 'side';
		modal?: boolean;
		children?: Snippet;
		footer?: Snippet;
	}

	let {
		isOpen,
		title,
		onClose,
		size = 'md',
		dismissible = true,
		closeLabel = 'Close',
		returnFocusTo = null,
		placement = 'center',
		modal = true,
		children,
		footer
	}: Props = $props();

	// Unique per modal, so a page with several names each dialog by its own title
	const titleId = $props.id();

	let dialogEl: HTMLDialogElement;
	// What had focus when the dialog opened, to have it again when the dialog closes.
	let opener: Element | null = null;

	function show() {
		if (untrack(() => modal)) dialogEl.showModal();
		else dialogEl.show();
	}

	function returnFocus() {
		if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
		opener = null;
	}

	$effect(() => {
		if (!dialogEl) return;
		if (isOpen && !dialogEl.open) {
			opener = untrack(() => returnFocusTo) ?? document.activeElement;
			show();
		} else if (!isOpen && dialogEl.open) {
			dialogEl.close();
			returnFocus();
		}
	});

	// Taken away while open (its caller's {#if} ended): focus still goes back.
	$effect(() => returnFocus);

	// While open, the part of the screen the person can see: on a phone the on-screen
	// keyboard takes the rest, and 100dvh does not shrink for it. The phone layout sizes
	// the dialog to this, so its actions stay above the keyboard.
	$effect(() => {
		const viewport = typeof window === 'undefined' ? null : window.visualViewport;
		if (!isOpen || !dialogEl || !viewport) return;
		const fit = () => {
			dialogEl.style.setProperty('--modal-viewport-height', `${viewport.height}px`);
			dialogEl.style.setProperty('--modal-viewport-top', `${viewport.offsetTop}px`);
		};
		fit();
		viewport.addEventListener('resize', fit);
		viewport.addEventListener('scroll', fit);
		return () => {
			viewport.removeEventListener('resize', fit);
			viewport.removeEventListener('scroll', fit);
		};
	});

	function dismiss() {
		if (dismissible) onClose();
	}

	// The browser can close a dialog itself (a second Escape with no click between).
	// Still open as far as the caller knows: ask it, or open again if it must be answered.
	// The close event comes a task after close(), so a dialog opened again in between
	// (a save closes it, a quick click opens the next) is open by then: nothing to do.
	function handleClose() {
		if (!isOpen || dialogEl.open) return;
		if (dismissible) onClose();
		else show();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialogEl) dismiss();
	}

	// Tab past the last control comes back to the first, and Shift+Tab the other way:
	// left alone, a browser can take focus out of the dialog to its own toolbar.
	const FOCUSABLE =
		'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]';
	function keepTabInside(e: KeyboardEvent) {
		// Only a modal dialog has the browser turn Escape into a cancel.
		if (e.key === 'Escape' && !modal) {
			e.preventDefault();
			dismiss();
		}
		if (e.key !== 'Tab' || !modal) return;
		const controls = [...dialogEl.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
			(control) => control.getClientRects().length > 0
		);
		const first = controls[0];
		const last = controls.at(-1);
		if (!first || !last) return;
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}
</script>

<dialog
	bind:this={dialogEl}
	aria-labelledby={titleId}
	aria-modal={modal}
	class="modal modal--{size}"
	class:modal--side={placement === 'side'}
	class:modal--inline={!modal}
	oncancel={(e) => {
		e.preventDefault();
		dismiss();
	}}
	onclose={handleClose}
	onclick={handleBackdropClick}
	onkeydown={keepTabInside}
>
	<!-- Inner div stops backdrop clicks propagating into content -->
	<div class="modal-inner" role="presentation" onclick={(e) => e.stopPropagation()}>
		<div class="modal-header">
			<h2 id={titleId} class="modal-title">{title}</h2>
			{#if dismissible}
				<Button variant="ghost" class="modal-close" aria-label={closeLabel} onclick={onClose}
					><X size={ICON_SIZE.md} aria-hidden="true" /></Button
				>
			{/if}
		</div>

		<div class="modal-body">
			{@render children?.()}
		</div>

		{#if footer}
			<div class="modal-footer">
				{@render footer()}
			</div>
		{/if}
	</div>
</dialog>

<style>
	.modal {
		/* The shared reset's `* { margin: 0 }` overrides the browser's default
		   `margin: auto` centering for <dialog>, so it must be restored explicitly here. */
		margin: auto;
		padding: var(--spacing-0);
		border: none;
		border-radius: var(--radius-xl);
		/* The browser's own cap on a modal dialog's size; these widths say it instead. */
		max-width: none;
		max-height: 90dvh;
		background: var(--color-surface-raised);
		/* Its own ink, not whatever the page around it sets. */
		color: var(--color-text-primary);
		box-shadow: var(--shadow-xl);
	}

	/* Its size's width, and never closer than a gutter to the edges of the window. */
	.modal--sm {
		width: min(var(--container-dialog), 100% - 2 * var(--spacing-4));
	}
	.modal--md {
		width: min(var(--container-sm), 100% - 2 * var(--spacing-4));
	}
	.modal--lg {
		width: min(var(--container-lg), 100% - 2 * var(--spacing-4));
	}
	.modal--xl {
		width: min(var(--container-xl), 100% - 2 * var(--spacing-4));
	}

	/* A full-height panel at the start edge, the navigation menu's. */
	.modal.modal--side {
		inset: var(--modal-viewport-top, 0) auto auto 0;
		width: min(var(--container-xs), 100%);
		height: var(--modal-viewport-height, 100dvh);
		max-height: none;
		margin: 0;
		border-radius: 0;
	}

	/* Not modal: not in the top layer, so fixed to the window on the dropdown layer. */
	.modal.modal--inline {
		position: fixed;
		z-index: var(--layer-dropdown);
	}

	/* And centred as a modal one is (the browser does that only for a modal dialog).
	   A side panel's placement and the phone's full screen still win. */
	.modal--inline {
		inset: 0;
	}

	.modal--side .modal-inner {
		height: 100%;
		max-height: none;
	}

	.modal::backdrop {
		background: var(--color-scrim);
	}

	/* ── Layout ───────────────────────────────────── */

	.modal-inner {
		display: flex;
		flex-direction: column;
		max-height: 90dvh;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-6);
		border-bottom: var(--border-width-1) solid var(--color-border);
		flex-shrink: 0;
	}

	.modal-title {
		margin: var(--spacing-0);
		font-size: var(--text-2xl);
		font-family: var(--font-sans);
		color: var(--color-text-primary);
	}

	.modal-header :global(.modal-close) {
		flex-shrink: 0;
	}

	/* A size container, so what is inside lays out by the dialog's width, not the
	   window's: a two-column form stacks in a sm dialog on any screen. */
	.modal-body {
		container: modal / inline-size;
		flex: 1;
		overflow-y: auto;
		padding: var(--spacing-6);
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-4);
		padding: var(--spacing-6);
		border-top: var(--border-width-1) solid var(--color-border);
		flex-shrink: 0;
	}

	/* ── Phone: the whole screen ──────────────────── */

	@media (width < 640px) {
		.modal {
			inset: var(--modal-viewport-top, 0) 0 auto 0;
			width: 100%;
			height: var(--modal-viewport-height, 100dvh);
			max-height: none;
			margin: 0;
			border-radius: 0;
			box-shadow: none;
		}

		.modal-inner {
			height: 100%;
			max-height: none;
		}

		.modal-header,
		.modal-body,
		.modal-footer {
			padding: var(--spacing-4);
		}

		/* Many actions wrap onto a second line rather than run off the screen. */
		.modal-footer {
			flex-wrap: wrap;
		}
	}
</style>
