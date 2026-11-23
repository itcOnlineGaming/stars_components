<!--
  Typography
  ----------
  Renders semantic text elements in the design system's eight text styles (the
  designer's decision 7; tokens.json, text-style).

  The `variant` prop is the style. The `as` prop is the rendered HTML element: they are
  independent so you can render an h2-styled heading as an <h3> for a correct document
  outline without breaking the design.

  Variants     Default element   Style
  --------     ---------------   -----
  display      p                 4xl bold, growing from 3xl on a phone. A hero title or big figure.
  h1           h1                3xl bold, growing from 2xl on a phone. Page title, one per page.
  h2           h2                2xl semibold. Section heading.
  h3           h3                xl semibold. Card or panel heading.
  body         p                 base. Default paragraph text.
  body-sm      p                 sm. Helper text, descriptions.
  label        span              sm semibold. A field label or column heading (use <label> via `as`).
  caption      span              xs medium, upper case, spaced. Eyebrows, timestamps, tags.

  Props
  -----
  variant  — The style (see table above). Defaults to 'body'.
  as       — Override the rendered HTML element.
  muted    — Apply --color-text-muted instead of --color-text-primary.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'body-sm' | 'label' | 'caption';

	const defaultElement: Record<Variant, string> = {
		display: 'p',
		h1: 'h1',
		h2: 'h2',
		h3: 'h3',
		body: 'p',
		'body-sm': 'p',
		label: 'span',
		caption: 'span'
	};

	interface Props {
		variant?: Variant;
		as?: string;
		muted?: boolean;
		class?: string;
		children?: Snippet;
	}

	let { variant = 'body', as, muted = false, class: extraClass = '', children }: Props = $props();

	const tag = as ?? defaultElement[variant];
</script>

<svelte:element
	this={tag}
	class="text text--{variant}{muted ? ' text--muted' : ''}{extraClass ? ' ' + extraClass : ''}"
>
	{@render children?.()}
</svelte:element>

<style>
	.text {
		font-family: var(--font-sans);
		color: var(--color-text-primary);
		margin: 0;
	}

	.text--muted {
		color: var(--color-text-muted);
	}

	.text--display {
		font-size: var(--text-display-size);
		font-weight: var(--text-display-weight);
		line-height: var(--text-display-leading);
		letter-spacing: var(--text-display-tracking);
	}

	.text--h1 {
		font-size: var(--text-h1-size);
		font-weight: var(--text-h1-weight);
		line-height: var(--text-h1-leading);
		letter-spacing: var(--text-h1-tracking);
	}

	.text--h2 {
		font-size: var(--text-h2-size);
		font-weight: var(--text-h2-weight);
		line-height: var(--text-h2-leading);
		letter-spacing: var(--text-h2-tracking);
	}

	.text--h3 {
		font-size: var(--text-h3-size);
		font-weight: var(--text-h3-weight);
		line-height: var(--text-h3-leading);
		letter-spacing: var(--text-h3-tracking);
	}

	.text--body {
		font-size: var(--text-body-size);
		font-weight: var(--text-body-weight);
		line-height: var(--text-body-leading);
		letter-spacing: var(--text-body-tracking);
	}

	.text--body-sm {
		font-size: var(--text-body-sm-size);
		font-weight: var(--text-body-sm-weight);
		line-height: var(--text-body-sm-leading);
		letter-spacing: var(--text-body-sm-tracking);
	}

	.text--label {
		font-size: var(--text-label-size);
		font-weight: var(--text-label-weight);
		line-height: var(--text-label-leading);
		letter-spacing: var(--text-label-tracking);
	}

	.text--caption {
		font-size: var(--text-caption-size);
		font-weight: var(--text-caption-weight);
		line-height: var(--text-caption-leading);
		letter-spacing: var(--text-caption-tracking);
		text-transform: var(--text-caption-case);
		color: var(--color-text-muted);
	}
</style>
