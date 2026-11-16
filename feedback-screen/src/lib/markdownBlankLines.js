const FENCE = /^ {0,3}(```|~~~)/;

/** Markdown treats any run of blank lines as one paragraph break. Keep the
 * extra ones the author typed by turning each blank line after the first into
 * an empty paragraph. Fenced code blocks are left as written.
 * @param {string} markdown
 * @returns {string}
 */
export function preserveBlankLines(markdown) {
	const output = [];
	let fence = null;
	let blanks = 0;
	for (const line of markdown.split('\n')) {
		const marker = line.match(FENCE)?.[1];
		if (fence) {
			if (marker === fence) fence = null;
			output.push(line);
			continue;
		}
		if (line.trim() === '') {
			blanks += 1;
			if (blanks > 1) output.push('&nbsp;', '');
			else output.push(line);
			continue;
		}
		blanks = 0;
		if (marker) fence = marker;
		output.push(line);
	}
	return output.join('\n');
}
