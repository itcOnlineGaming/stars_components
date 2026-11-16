// Stand-in for SvelteKit's $app/stores: the page store, read from the address bar.
import { readable } from 'svelte/store';

export const page = readable({ url: new URL(window.location.href), params: {} });
