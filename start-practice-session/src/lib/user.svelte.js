// Not a Stars file. Stars keeps the signed-in user in $lib/user.svelte.js, and SvelteKit
// reads every $lib import from src/lib/, so this passes the import on to the stand-in in
// src/mock/user.svelte.js.
export * from '../mock/user.svelte.js';
