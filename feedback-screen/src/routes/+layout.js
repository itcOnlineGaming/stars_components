// The mockup runs only in the browser, as the copied components and the stand-ins in
// src/mock/ expect. Each page is still built as its own HTML file (npm run build), so a
// version at /b works from any static host.
export const ssr = false;
export const prerender = true;
