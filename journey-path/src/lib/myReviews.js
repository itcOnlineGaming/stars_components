// Presentation helpers for the "Read your reviews" page (routes/briefs/reviews).

const KIND_LABELS = {
	self: 'Self review',
	ai: 'AI review',
	peer: 'Peer review',
	teacher: 'Teacher review'
};

export function reviewKindLabel(kind) {
	return KIND_LABELS[kind] || 'Review';
}

// "Version 2 (latest, submitted)"; the parenthesis is left out when neither applies.
export function versionHeading(version) {
	const notes = [];
	if (version.is_latest) notes.push('latest');
	if (version.submitted) notes.push('submitted');
	return `Version ${version.version_number}${notes.length ? ` (${notes.join(', ')})` : ''}`;
}

// "1 new review" / "2 new reviews"
export function newReviewsText(count) {
	return `${count} new ${count === 1 ? 'review' : 'reviews'}`;
}
