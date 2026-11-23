import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
	// TypeScript in the copied components (lang="ts") is compiled the way Stars compiles it.
	preprocess: vitePreprocess(),
	kit: {
		// npm run build writes a static copy to dist/, one HTML file per page. 404.html
		// opens any other address in the app, on a host that serves it for unknown paths.
		adapter: adapter({ pages: 'dist', assets: 'dist', fallback: '404.html' }),
		// The files copied from Stars import through Stars's own paths: $ui is this app's copy
		// of the design system, and @stars/admin-exercises a stand-in in src/mock/. $lib is
		// src/lib/, where fetch.js passes on to the stand-in for the Stars server.
		alias: {
			'@stars/admin-exercises': 'src/mock/admin-exercises.js',
			$ui: 'ui'
		}
	}
};
