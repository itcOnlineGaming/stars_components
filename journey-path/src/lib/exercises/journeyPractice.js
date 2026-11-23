/** Restore the practice editor from its existing URL config (no extra persisted fields). */
export function practiceTarget(value) {
	try {
		const url = new URL(value, 'https://journey.invalid');
		if (/\/practise-exemplars\/?$/.test(url.pathname)) {
			const id = url.searchParams.get('exemplar');
			return {
				mode: 'exemplars',
				exemplarId:
					/^[1-9]\d*$/.test(id ?? '') && Number.isSafeInteger(Number(id)) ? Number(id) : null
			};
		}
	} catch {
		// Legacy empty or custom URLs retain the exercise editor's default.
	}
	return { mode: 'exercises', exemplarId: null };
}

/** Internal practice routes supported by Journey V2, including published legacy links. */
export function internalPracticeUrl(value, base, origin) {
	if (!value || value.startsWith('//') || value.includes('\\')) return null;
	try {
		const url = new URL(value, origin);
		if (url.origin !== origin) return null;
		if (
			![`${base}/practise`, `${base}/practise-exercises`].includes(url.pathname.replace(/\/$/, ''))
		)
			return null;
		return url;
	} catch {
		return null;
	}
}

export function practiceHref(skill, base) {
	return `${base}/practise-exercises/?skills=${encodeURIComponent(skill)}`;
}

/**
 * Exemplar practice for the given skills: the practice entry screen, which checks how
 * many exemplars are available and starts a fresh set. A validated journey return
 * link is kept so the learner can still get back to their journey.
 */
export function exemplarPracticeHref(skillIds, base, returnHref = null) {
	const query = new URLSearchParams();
	if (skillIds?.length) query.set('skill_ids', skillIds.join(','));
	if (returnHref) query.set('return', returnHref);
	const search = query.toString();
	return `${base}/practise-exemplars/${search ? `?${search}` : ''}`;
}

/** Only a local Journey V2 path can supply a return target or journey ID. */
export function journeyReturn(value, base) {
	if (!value || !value.startsWith(`${base}/journeys/v2/`)) return null;
	const suffix = value.slice(`${base}/journeys/v2/`.length);
	if (!/^[1-9]\d*\/?$/.test(suffix)) return null;
	const journeyId = Number(suffix.replace(/\/$/, ''));
	if (!Number.isSafeInteger(journeyId)) return null;
	return { journeyId, href: `${base}/journeys/v2/${journeyId}/` };
}

/** Preserve external links and brief workflows; normalise only known internal practice. */
export function journeyLaunchHref(href, step, journeyId, base, origin) {
	if (
		step.step_kind === 'resource' &&
		step.config?.resource_type === 'catalog' &&
		!step.config?.url
	) {
		const id = Number(step.config.resource_id);
		if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Invalid resource ID.');
		// The resource ID is stable across replacements and stale-slug redirects.
		href = `${base}/resources/${id}/guide/`;
	}
	const practice =
		step.step_kind === 'practice' && step.launch_mode === 'open_url'
			? internalPracticeUrl(href, base, origin)
			: null;
	if (practice && (practice.searchParams.has('skills') || practice.searchParams.has('skill_ids'))) {
		practice.pathname = `${base}/practise-exercises/`;
		href = `${practice.pathname}${practice.search}${practice.hash}`;
	}
	// URLSearchParams preserves encoded skill names and places the query before the hash.
	const url = new URL(href, origin);
	if (
		step.step_kind === 'practice' &&
		step.config?.practice_settings_version &&
		url.origin === origin
	) {
		url.searchParams.set('journey_practice', String(journeyId));
		url.searchParams.set('journey_step', String(step.journey_step_id));
	}
	// Old journey URLs may contain a renamed or ambiguous skill name. The saved
	// skill ID is authoritative for skill-based exemplar practice.
	const skillId = step.config?.skill_ids?.length === 1 ? Number(step.config.skill_ids[0]) : null;
	if (
		step.step_kind === 'practice' &&
		step.launch_mode === 'open_url' &&
		url.origin === origin &&
		url.pathname.replace(/\/$/, '') === `${base}/practise-exemplars` &&
		!url.searchParams.has('exemplar') &&
		Number.isSafeInteger(skillId) &&
		skillId > 0
	) {
		url.searchParams.delete('skills');
		url.searchParams.set('skill_ids', String(skillId));
	}
	url.searchParams.set('return', `${base}/journeys/v2/${journeyId}/`);
	return href.startsWith('/') && !href.startsWith('//')
		? `${url.pathname}${url.search}${url.hash}`
		: url.href;
}

export function matchingMasteryMilestones(detail, progress, skill, skillId = null) {
	const name = skill.trim().toLowerCase();
	return (detail?.steps ?? [])
		.filter(
			(step) =>
				step.step_kind === 'milestone' &&
				step.config?.target_type === 'skill_mastery' &&
				(skillId != null && step.config.skill_id != null
					? String(step.config.skill_id) === String(skillId)
					: step.config.skill_name?.trim().toLowerCase() === name)
		)
		.map((step) => ({
			...step,
			progress: progress?.steps?.find((item) => item.journey_step_id === step.journey_step_id)
		}));
}
