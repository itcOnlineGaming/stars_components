export const standards = ['Nothing', 'Major issues', 'Minor issues', 'Satisfied', 'Exceeded'];

export function suggestStandard(items) {
	const applicable = items.filter((i) => ['yes', 'no'].includes(i.answer));
	const yes = applicable.filter((i) => i.answer === 'yes').length;
	return {
		suggested: !applicable.length
			? null
			: yes === applicable.length
			  ? 3
			  : yes * 5 >= applicable.length * 4
			    ? 2
			    : 1,
		yes_count: yes,
		applicable_count: applicable.length
	};
}

export function reviewStandardLabel(review) {
	const overall = review.standards?.overall;
	if (review.standards && !overall) return 'Standard unavailable';
	const answers = review.checklist || [];
	if (
		!overall &&
		(!answers.length || answers.some((i) => !['yes', 'no', 'n/a'].includes(i.answer)))
	)
		return 'Standard unavailable';
	const selected = overall ? overall.selected : suggestStandard(review.checklist || []).suggested;
	return selected == null
		? 'Unassessed'
		: `${selected} ${standards[selected]}${
				review.standards?.provenance === 'historical_answers' || !review.standards
					? ' · calculated from historical answers'
					: ''
		  }`;
}
