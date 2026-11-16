import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// TypeScript in the copied components (lang="ts") is compiled the way Stars compiles it.
export default { preprocess: vitePreprocess() };
