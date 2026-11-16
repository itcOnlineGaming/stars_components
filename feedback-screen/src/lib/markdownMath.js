/** @type {Promise<typeof MathJax> | undefined} */
let loading;
let typesetting = Promise.resolve();

export function loadMathematics() {
	if (!loading) {
		loading = new Promise((resolve, reject) => {
			// Forget a failed load, so the next preview tries again.
			const fail = (/** @type {Error} */ error) => {
				script.remove();
				loading = undefined;
				reject(error);
			};
			window.MathJax = {
				loader: { load: ['ui/safe'] },
				tex: {
					inlineMath: [
						['$', '$'],
						['\\(', '\\)']
					],
					displayMath: [
						['$$', '$$'],
						['\\[', '\\]']
					]
				}
			};
			const script = document.createElement('script');
			script.id = 'MathJax-script';
			script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
			script.async = true;
			script.onload = () => {
				Promise.resolve(window.MathJax.startup?.promise).then(() => {
					if (typeof window.MathJax.typesetPromise !== 'function') {
						fail(new Error('MathJax did not initialise'));
						return;
					}
					resolve(window.MathJax);
				}, fail);
			};
			script.onerror = () => fail(new Error('Unable to load MathJax'));
			document.head.append(script);
		});
	}
	return loading;
}

/** Load once and serialise rendering across editor/view mounts. Never rejects: when
 * MathJax cannot load (offline, CDN down) the TeX stays as text, and a failure must not
 * stop the previews queued after it.
 * @param {HTMLElement} element
 * @returns {Promise<void>}
 */
export function typesetMarkdown(element) {
	typesetting = typesetting
		.then(async () => {
			if (!element.isConnected) return;
			const mathematics = await loadMathematics();
			if (element.isConnected && mathematics.typesetPromise) {
				await mathematics.typesetPromise([element]);
			}
		})
		.catch((error) => console.warn('Mathematics left unrendered:', error));
	return typesetting;
}
