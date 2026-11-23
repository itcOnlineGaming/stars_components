import { practiceTarget } from './exercises/journeyPractice.js';
import { newReviewsText } from './myReviews.js';

/**
 * One-line tag text for a Journey Builder V2 step, shown under its node in
 * JourneyPath.svelte. Shared between the teacher builder (admin/journeys/[journeyId])
 * and the learner runtime (journeys/v2/[journeyId]).
 *
 * `progress` is the learner's per-step progress record (see
 * journey_progress_service.get_progress_for_journey_steps), passed only by the learner
 * page. Every branch except milestone ignores it entirely, since only a milestone's
 * target is something the learner has "progress" toward - everything else is just a
 * static description of the step's own config.
 */
/**
 * done/total fraction for a milestone step's node icon (the segmented ring in
 * JourneyPath.svelte). Returns null when the step isn't a milestone, has no learner
 * progress (builder mode), or has no target to segment against - callers fall back to
 * the plain icon in that case.
 */
// done/total for a brief_checklist milestone, taken from the backend's live requirements
// list (the same list the milestone popup renders) rather than any list stored in config.
function checklistDoneTotal(details) {
	const requirements = details.requirements || [];
	return {
		done: requirements.filter((r) => r.completed).length,
		total: requirements.length
	};
}

export function journeyStepMilestoneProgress(step, progress) {
	if (step.step_kind !== 'milestone' || !progress || progress.status === 'unavailable') return null;
	const config = step.config || {};
	const details = progress.details || {};

	if (config.target_type === 'skill_mastery') {
		const total = Math.round(Number(config.target_level)) || 0;
		if (!total) return null;
		const done = Math.min(Math.round(details.average_level ?? 0), total);
		return { done, total };
	}

	const { done, total } = checklistDoneTotal(details);
	if (!total) return null;
	return { done, total };
}

function formatDueDate(dueAt) {
	if (!dueAt) return '';
	const date = new Date(dueAt);
	if (Number.isNaN(date.getTime())) return '';
	return date.toLocaleString(undefined, {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	});
}

// " · Due <date>", or " · Overdue (was due <date>)" once the due date has passed and
// the milestone still isn't complete. Empty string when there's no due date set.
function dueDateSuffix(dueAt, isComplete) {
	const formatted = formatDueDate(dueAt);
	if (!formatted) return '';
	if (!isComplete && new Date(dueAt).getTime() < Date.now()) {
		return ` · Overdue (was due ${formatted})`;
	}
	return ` · Due ${formatted}`;
}

// What a learner can do with an Understanding check step, from its progress details.
const UNDERSTANDING_CHECK_TAGS = {
	not_submitted: 'Submit your work first',
	waiting: 'Waiting for your teacher',
	ready: 'Questions ready',
	answered: 'Answered'
};

export function journeyStepSummary(step, progress) {
	const config = step.config || {};
	if (step.step_kind === 'practice_plan' && progress) {
		const d = progress.details || {};
		return `${d.plan_status?.state === 'off_track' ? '⚠ Off track · Fix plan · ' : ''}${
			d.sessions_completed ?? 0
		}/${d.sessions_required ?? 0} sessions completed`;
	}
	if (progress?.status === 'unavailable') {
		return config.target_type === 'skill_mastery'
			? 'Skill mastery temporarily unavailable'
			: 'Practice progress temporarily unavailable';
	}
	// Learner mode (progress passed) keeps tags human-readable: no raw URLs/paths and
	// no "Brief #349"/"Reflection #7" id-number fallbacks - those are only meaningful
	// to a teacher editing config, not to a learner reading the journey.
	const isLearner = progress !== undefined;

	// Their self review was of an earlier version: editing the work started a new one,
	// which needs its own (see JourneyProgressService self_evaluation). Every brief
	// step's details carry the flag, so only the self evaluation step shows it.
	if (step.step_kind === 'self_evaluation' && progress?.details?.self_review_outdated) {
		return 'Your work has changed since your self review: self-review the latest version';
	}

	if (step.step_kind === 'read_reviews' && progress?.details?.unseen_reviews > 0) {
		return newReviewsText(progress.details.unseen_reviews);
	}

	if (step.step_kind === 'understanding_check') {
		const uc = progress?.details?.uc_state;
		if (uc) return UNDERSTANDING_CHECK_TAGS[uc] || 'Understanding check';
		if (isLearner) return 'Understanding check';
		const kind = config.check_type === 'practice' ? 'Practice' : 'Lab test';
		const work = config.brief_title || config.checks_step_title;
		return work ? `${kind} · ${work}` : kind;
	}

	if (step.step_kind === 'milestone') {
		if (!progress) {
			// Builder: describe the configured target, no fraction/overdue state -
			// there's no learner progress to compute it from in this view.
			const dueText = config.due_at ? ` · Due ${formatDueDate(config.due_at)}` : '';
			return (
				(config.target_type === 'skill_mastery'
					? `Skill mastery · ${config.skill_name || 'skill'} ≥ ${config.target_level}`
					: 'Checklist · all items on brief') + dueText
			);
		}
		// Learner: compute the actual progress fraction from progress.details.
		const details = progress.details || {};
		if (config.target_type === 'skill_mastery') {
			const current = Math.round(details.average_level ?? 0);
			const isComplete = current >= config.target_level;
			return (
				`${config.skill_name || 'skill'}: ${current}/${config.target_level}` +
				dueDateSuffix(config.due_at, isComplete)
			);
		}
		const { done, total } = checklistDoneTotal(details);
		const isComplete = total > 0 && done >= total;
		return `Checklist: ${done}/${total} items` + dueDateSuffix(config.due_at, isComplete);
	}

	switch (step.step_kind) {
		case 'weekly_marks':
			return 'Weekly marks and comments · Informational';
		case 'practice':
			if (isLearner && progress?.details?.requirements) {
				return Object.entries(progress.details.requirements)
					.map(
						([method, count]) =>
							`${method === 'exercise' ? 'Exercises' : 'Exemplars'}: ${Math.min(
								count.completed,
								count.required
							)}/${count.required}`
					)
					.join(' or ');
			}
			if (config.brief_id) {
				return `${
					config.brief_title || (isLearner ? 'Brief' : `Brief #${config.brief_id}`)
				} (upload work)`;
			}
			if (isLearner) {
				const label =
					practiceTarget(config.url).mode === 'exemplars'
						? 'Practice exemplar'
						: 'Practice exercise';
				const details = progress?.details;
				return details?.exercises_required
					? `${label}: ${Math.min(details.exercises_reviewed ?? 0, details.exercises_required)}/${
							details.exercises_required
					  }`
					: label;
			}
			return config.url || 'No URL set';
		case 'view_brief':
		case 'specify_feedback':
			if (!config.brief_id) return '';
			return config.brief_title || (isLearner ? 'Brief' : `Brief #${config.brief_id}`);
		case 'resource':
			if (isLearner) return 'Resource';
			return config.resource_type === 'document' ? config.document_path || '' : config.url || '';
		case 'reflection':
			return (
				config.prompt_group_name ||
				(isLearner ? 'Reflection' : `Reflection #${config.prompt_group_id ?? '?'}`)
			);
		case 'scaffold':
			return config.scaffold_type || '';
		default:
			if (!config.brief_id) return '';
			return config.brief_title || (isLearner ? 'Brief' : `Brief #${config.brief_id}`);
	}
}
