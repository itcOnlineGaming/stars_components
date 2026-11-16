import DOMPurify from 'dompurify';

/** Sanitise rendered Markdown immediately before browser DOM insertion.
 * @param {string} html
 * @returns {string}
 */
export function sanitizeMarkdownHtml(html) {
	return DOMPurify.sanitize(html);
}
