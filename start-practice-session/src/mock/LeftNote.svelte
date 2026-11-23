<script>
	// Shown at any address the mockup has no page for: where "Start practice" (or a link)
	// would have taken the learner in Stars, with the settings it carries. Not part of Stars.
	import MockupBar from './MockupBar.svelte';
	import ApiCalls from './ApiCalls.svelte';

	const url = new URL(window.location.href);
	const settings = [...url.searchParams].filter(([key]) => key !== 'return');
	// Back to the page the learner came from, so /b returns to /b with its scenario.
	const referrer = document.referrer && new URL(document.referrer);
	const back = referrer && referrer.origin === url.origin ? referrer.href : '/';
</script>

<MockupBar title="Start practice session mockup" />

<main>
	<section class="mockup-note">
		<h1>The learner has left the choice screen</h1>
		<p>In Stars this opens <code>{url.pathname}</code>{settings.length ? ' with:' : '.'}</p>
		{#if settings.length}
			<dl>
				{#each settings as [key, value]}<dt>{key}</dt><dd>{value}</dd>{/each}
			</dl>
		{/if}
		<p><a href={back}>Back to the choice screen</a></p>
	</section>
	<ApiCalls />
</main>

<style>
	main {
		padding: var(--spacing-4);
	}
	.mockup-note {
		max-width: var(--container-md);
		padding: var(--spacing-6);
	}
	dl {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: var(--spacing-1) var(--spacing-4);
	}
	dt {
		color: var(--color-text-muted);
	}
	dd {
		margin: var(--spacing-0);
	}
</style>
