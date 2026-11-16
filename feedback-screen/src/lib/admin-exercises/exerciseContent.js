import { Lexer, Marked, Tokenizer } from 'marked';
const markdown = new Marked({
	gfm: true,
	breaks: true,
	tokenizer: {
		link() {
			return false;
		},
		reflink() {
			return false;
		},
		url() {
			return false;
		},
		autolink() {
			return false;
		}
	}
});
import DOMPurify from 'dompurify';

const escapeHtml = (text) =>
	text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const escapeExerciseMarkdown = (text) =>
	text.replace(/([\\`*_{}[\]()#+.!|>~<\-&])/g, '\\$1');
const escapedAt = (text, index) => (text.slice(0, index).match(/\\+$/)?.[0].length ?? 0) % 2 === 1;

// Kept in agreement with python/exercise_content.py by shared conformance fixtures.
export function exerciseSegments(source, strict = false) {
	source = source.replace(/\r\n?/g, '\n');
	const marker = /^ {0,3}(`{3,}|~{3,})[^\n]*\n|<code>|`+/gim;
	const result = [];
	let position = 0;
	let match;
	while ((match = marker.exec(source))) {
		if (escapedAt(source, match.index)) continue;
		const bodyStart = marker.lastIndex;
		let close;
		let kind = 'code';
		if (match[1]) {
			close = new RegExp(
				'^ {0,3}' + match[1][0] + '{' + match[1].length + ',}[ \\t]*(?:\\n|$)',
				'm'
			).exec(source.slice(bodyStart));
			kind = 'block';
		} else if (match[0].toLowerCase() === '<code>') {
			close = /<\/code>/i.exec(source.slice(bodyStart));
		} else {
			close = new RegExp('(?<!`)' + match[0] + '(?!`)').exec(source.slice(bodyStart));
		}
		if (!close) {
			if (strict) throw new Error('Unclosed code marker. Close it or escape it as literal text.');
			continue;
		}
		const end = bodyStart + close.index + close[0].length;
		let text = source.slice(bodyStart, bodyStart + close.index);
		if (match[1] && text.endsWith('\n')) {
			text = text.slice(0, -1);
			if (source[end - 1] === '\n' && end < source.length) text += '\n';
		}
		if (text.includes('\n')) kind = 'block';
		if (match.index > position)
			result.push({ kind: 'text', text: source.slice(position, match.index) });
		result.push({ kind, text });
		position = marker.lastIndex = end;
	}
	if (position < source.length) result.push({ kind: 'text', text: source.slice(position) });
	return result;
}

function decodeEntities(value) {
	// Marked emits escaped text and entities. Decode only in a detached text node.
	const textarea = document.createElement('textarea');
	textarea.innerHTML = value;
	return textarea.value;
}

function inline(source, html) {
	const walk = (tokens) =>
		tokens
			.map((token) => {
				if (['strong', 'em', 'del'].includes(token.type)) {
					const text = walk(token.tokens ?? []);
					return html ? `<${token.type}>${text}</${token.type}>` : text;
				}
				if (token.type === 'br') return html ? '<br>' : '\n';
				if (token.type === 'html') {
					if (/^<\/?(?:u|strong|em|del)>$/i.test(token.raw))
						return html ? token.raw.toLowerCase() : '';
					return html ? escapeHtml(token.raw) : token.raw;
				}
				if (token.type === 'escape' || token.type === 'text') {
					const text = decodeEntities(token.text ?? token.raw);
					return html ? escapeHtml(text).replace(/\n/g, '<br>') : text;
				}
				// Unsupported syntax, including links/images, remains literal.
				return html ? escapeHtml(token.raw) : token.raw;
			})
			.join('');
	return walk(new Lexer(markdown.defaults).inlineTokens(source));
}

function parseContent(source, html, strict = false) {
	let prefix = 'EXERCISECODE';
	while (source.includes(prefix)) prefix += 'x';
	const protectedCode = {};
	let text = exerciseSegments(source, strict)
		.map((segment) => {
			if (segment.kind === 'text') return segment.text;
			const key = `${prefix}${Object.keys(protectedCode).length}END`;
			protectedCode[key] = segment;
			return key;
		})
		.join('');
	// Protect unsupported links as atomic literal text before emphasis matching.
	const tokenizer = new Tokenizer(markdown.defaults);
	new Lexer({ ...markdown.defaults, tokenizer });
	const parts = [];
	let position = 0;
	for (const match of text.matchAll(/!?\[/g)) {
		const start = match.index;
		if (start < position || escapedAt(text, start)) continue;
		const token = tokenizer.link(text.slice(start));
		if (!token || !['link', 'image'].includes(token.type)) continue;
		const key = `${prefix}${Object.keys(protectedCode).length}END`;
		protectedCode[key] = { kind: 'literal', text: token.raw };
		parts.push(text.slice(position, start), key);
		position = start + token.raw.length;
	}
	parts.push(text.slice(position));
	text = parts.join('');
	let output = inline(text, html);
	for (const [key, { kind, text: content }] of Object.entries(protectedCode).reverse()) {
		const replacement = !html
			? content
			: kind === 'literal'
			  ? escapeHtml(content)
			  : kind === 'block'
			    ? `<pre><code>${escapeHtml(content)}</code></pre>`
			    : `<code>${escapeHtml(content)}</code>`;
		output = output.replaceAll(key, () => replacement);
	}
	return output;
}

export function exercisePlainText(source, strict = false) {
	return parseContent(source, false, strict);
}

export function renderExerciseMarkdown(source) {
	const html = parseContent(source, true);
	return DOMPurify.sanitize(html, {
		ALLOWED_TAGS: ['strong', 'em', 'del', 'u', 'code', 'pre', 'br'],
		ALLOWED_ATTR: []
	});
}

export function richDraft(exercise) {
	return exercise.richContent
		? JSON.parse(JSON.stringify(exercise.richContent))
		: {
				version: 1,
				question: escapeExerciseMarkdown(exercise.question),
				responses: exercise.responses.map(escapeExerciseMarkdown),
				feedbacks: exercise.feedbacks.map(escapeExerciseMarkdown)
		  };
}

export function projectedDraft(exercise, rich, initial) {
	if (JSON.stringify(rich) === JSON.stringify(initial) && !exercise.richContent) return exercise;
	return {
		...exercise,
		richContent: JSON.parse(JSON.stringify(rich)),
		question: exercisePlainText(rich.question, true),
		responses: rich.responses.map((value) => exercisePlainText(value, true)),
		feedbacks: rich.feedbacks.map((value) => exercisePlainText(value, true))
	};
}
