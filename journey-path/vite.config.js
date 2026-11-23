import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

// The import paths ($lib, $ui and the stand-ins for Stars) are set in svelte.config.js.
// The dev server serves only SvelteKit's own folders unless told otherwise, and the design
// system is in ui/, beside src/.
export default defineConfig({
	plugins: [sveltekit()],
	server: { fs: { allow: ['ui'] } }
});
