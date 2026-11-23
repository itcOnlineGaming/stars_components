/**
 * The chart series colours, --color-data-1 to -6 (tokens.json), as the theme sets them,
 * for a canvas chart (Chart.js) that cannot read CSS itself. Read them when the chart is
 * drawn, from an element inside the themed page, so the look and light or dark apply.
 *
 * The light theme's values stand in where no tokens are loaded (a unit test).
 */
const LIGHT = ['#2563eb', '#c2410c', '#0f766e', '#c026d3', '#a16207', '#64748b'];

/** @param {Element | null | undefined} element */
export function dataColours(element) {
	if (!element || typeof getComputedStyle !== 'function') return [...LIGHT];
	const style = getComputedStyle(element);
	return LIGHT.map((light, i) => style.getPropertyValue(`--color-data-${i + 1}`).trim() || light);
}
