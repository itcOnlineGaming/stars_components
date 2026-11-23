// Not a Stars file. Stars's API client is $lib/fetch.js, and SvelteKit reads every $lib
// import from src/lib/, so this passes the import on to the stand-in in src/mock/fetch.js.
export * from '../mock/fetch.js';
