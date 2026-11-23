<script>
	// The same global styles Stars loads in its src/routes/+layout.svelte, for every page.
	import '$ui/tokens/index.css';
	import '$ui/styles/reset.css';
	import '$ui/styles/base.css';
	import '$ui/styles/utilities.css';

	let { children } = $props();
</script>

{@render children()}
