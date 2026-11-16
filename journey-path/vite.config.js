import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

// The files copied from Stars import through Stars's own paths ($lib, $ui, $app/...).
// These send each one to this app's copy, or to a stand-in in src/mock/ for the parts
// that would need the real server, the signed-in user or SvelteKit. The more specific
// entries come first.
export default defineConfig({
	plugins: [svelte()],
	resolve: {
		alias: [
			{ find: /^\$lib\/fetch\.js$/, replacement: here('./src/mock/fetch.js') },
			{ find: /^\$lib\/user\.svelte\.js$/, replacement: here('./src/mock/user.svelte.js') },
			{ find: /^\$app\/paths$/, replacement: here('./src/mock/app-paths.js') },
			{ find: /^\$app\/stores$/, replacement: here('./src/mock/app-stores.js') },
			{ find: /^@stars\/admin-exercises$/, replacement: here('./src/mock/admin-exercises.js') },
			{ find: /^\$lib/, replacement: here('./src/lib') },
			{ find: /^\$ui/, replacement: here('./ui') }
		]
	}
});
