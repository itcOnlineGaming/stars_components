/**
 * Svelte action for a list of records that stacks as cards on a phone (.table-stack in
 * styles/utilities.css): <table class="table-stack" use:stackTable>.
 *
 * Each body cell gets its column's name as data-label, which the stacked card shows
 * before the value; a column with no visible name (a row's actions) gets none and takes
 * the whole line. The table also gets ARIA table roles, because laying its rows out as
 * blocks drops the table semantics in some browsers; a cell with a role of its own (a
 * checkbox) keeps it. Rows added later are labelled too.
 */
const TABLE_ROLES = new Set(['table', 'rowgroup', 'row', 'cell', 'columnheader', 'rowheader']);

/** Give `element` a table role, unless it already has a role of its own (a checkbox cell). */
function setRole(element, role) {
	const own = element.getAttribute('role');
	if (!own || TABLE_ROLES.has(own)) element.setAttribute('role', role);
}

export function stackTable(table) {
	const apply = () => {
		const names = [];
		for (const th of table.querySelectorAll(':scope > thead > tr:last-child > th')) {
			const name = th.getAttribute('aria-label') || th.textContent.trim();
			for (let span = 0; span < (th.colSpan || 1); span++) names.push(name);
		}
		setRole(table, 'table');
		for (const group of table.querySelectorAll(':scope > thead, :scope > tbody, :scope > tfoot')) {
			setRole(group, 'rowgroup');
		}
		for (const row of table.querySelectorAll(':scope > * > tr')) {
			setRole(row, 'row');
			let column = 0;
			for (const cell of row.children) {
				const header = cell.tagName === 'TH';
				setRole(
					cell,
					header ? (row.parentElement.tagName === 'THEAD' ? 'columnheader' : 'rowheader') : 'cell'
				);
				if (!header && row.parentElement.tagName !== 'THEAD') {
					if (names[column]) cell.dataset.label = names[column];
					else delete cell.dataset.label;
				}
				column += cell.colSpan || 1;
			}
		}
	};
	apply();
	const observer = new MutationObserver(apply);
	observer.observe(table, { childList: true, subtree: true, characterData: true });
	return { destroy: () => observer.disconnect() };
}
