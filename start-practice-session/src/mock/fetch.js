// Stand-in for Stars's API client ($lib/fetch.js). The copied components call these
// exactly as they call the real server; each request is answered from src/mock/api.js
// and added to the API calls panel, so you can see what the component asks for.
import { routes } from './api.js';
import { apiLog } from './apiLog.svelte.js';

const DELAY_MS = 150;

async function call(method, api, body) {
	const url = new URL(api, 'http://mock');
	const key = `${method} ${url.pathname}`;
	const handler = routes[key];
	await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
	if (!handler) {
		apiLog.calls.unshift({ method, path: api, body, status: 'not mocked' });
		throw new Error(`The mockup has no answer for ${key} (add one to src/mock/api.js)`);
	}
	const result = structuredClone(handler({ query: url.searchParams, body }));
	apiLog.calls.unshift({ method, path: api, body, status: 'ok' });
	return result;
}

export const getJson = (api) => call('GET', api);
export const postJson = (api, data = {}) => call('POST', api, data);
export const putJson = (api, data = {}) => call('PUT', api, data);
export const patchJson = (api, data = {}) => call('PATCH', api, data);
export const deleteJson = (api, data = {}) => call('DELETE', api, data);
export async function getBlob(api) {
	await call('GET', api);
	return new Blob([]);
}
