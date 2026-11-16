export const UNCATEGORISED = 'Uncategorised';

const sectionOf = (item: object) => (item as { section_name?: string | null }).section_name;

/**
 * The heading to show above items[index], or null when none is needed: the item
 * is not shown, it continues the previous shown item's section, or no shown item
 * has a section at all (so unsectioned checklists look exactly as before).
 */
export function sectionHeadingAt<T extends object>(
	items: T[],
	index: number,
	isShown: (item: NoInfer<T>) => boolean = () => true
): string | null {
	const item = items[index];
	if (!item || !isShown(item)) return null;
	if (!items.some((i) => isShown(i) && sectionOf(i))) return null;

	const nameOf = (i: T) => sectionOf(i) || UNCATEGORISED;
	for (let j = index - 1; j >= 0; j--) {
		if (isShown(items[j])) return nameOf(items[j]) === nameOf(item) ? null : nameOf(item);
	}
	return nameOf(item);
}

export interface SectionGroup<T> {
	name: string | null;
	items: T[];
}

/**
 * Items grouped under their section, for pages that show each section as a block
 * (a table's row group, an editor's group of items). Sections keep the order they
 * first appear in; items not on the brief's checklist (on_checklist false) come last
 * under notOnChecklist. With no sections and nothing off the checklist there is one
 * group with no name, so unsectioned checklists look exactly as before.
 */
export function groupBySection<T extends object>(
	items: T[],
	notOnChecklist: string
): SectionGroup<T>[] {
	const offChecklist = (i: T) => (i as { on_checklist?: boolean }).on_checklist === false;
	if (!items.some((i) => sectionOf(i) || offChecklist(i))) return [{ name: null, items }];

	const groups = new Map<string, T[]>();
	for (const item of items.filter((i) => !offChecklist(i))) {
		const name = sectionOf(item) || UNCATEGORISED;
		groups.set(name, [...(groups.get(name) ?? []), item]);
	}
	const off = items.filter(offChecklist);
	if (off.length) groups.set(notOnChecklist, off);
	return [...groups].map(([name, grouped]) => ({ name, items: grouped }));
}
