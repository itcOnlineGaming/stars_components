export const EXERCISE_TYPES = ['exact answer', 'model answer', 'multiple choice'];

export function createEmptyExercise() {
	return {
		id: -1,
		skills: [],
		classGroups: [],
		status: 'active',
		shortName: '',
		questionType: '',
		source: '',
		question: '',
		responses: [],
		feedbacks: []
	};
}

export function exerciseFromDto(dto = {}) {
	return {
		status: dto.status === 'inactive' ? 'inactive' : 'active',
		groupId: dto.group_id ?? null,
		assigned: dto.assigned === true,
		canEdit: dto.can_edit !== false,
		canDelete: dto.can_delete !== false,
		groupCount: dto.group_count ?? 0,
		permissionReason: dto.reason ?? '',
		id: dto.exerciseid ?? dto.id ?? -1,
		contentVersion: dto.content_version ?? null,
		richContent: dto.rich_content ?? null,
		choiceMarkdown: dto.choice_markdown ?? dto.rich_content?.responses ?? [],
		skills: Array.isArray(dto.skills) ? dto.skills : [],
		skillIds: Array.isArray(dto.skill_ids) ? dto.skill_ids : [],
		classGroups: normaliseClassGroups(dto.class_groups ?? dto.classGroups),
		shortName: dto.shortname ?? dto.shortName ?? '',
		questionType: dto.type ?? dto.questionType ?? '',
		source: dto.source ?? '',
		owner: dto.owner ?? null,
		question: dto.text ?? dto.question ?? '',
		responses: normaliseList(dto.answers ?? dto.responses),
		feedbacks: normaliseList(dto.feedbacks)
	};
}

export function exerciseToPayload(exercise) {
	const payload = {
		skills: exercise.skills.map((skill) => skill.trim().toLowerCase()).filter(Boolean),
		shortname: exercise.shortName.trim(),
		type: exercise.questionType.trim().toLowerCase(),
		source: exercise.source.trim(),
		question: exercise.question.trim(),
		responses: exercise.responses.map((response) => response.trim()).filter(Boolean),
		feedbacks: exercise.feedbacks.map((feedback) => feedback.trim()).filter(Boolean)
	};
	if (exercise.id !== -1) payload.exerciseid = exercise.id;
	if (exercise.richContent) {
		payload.rich_content = JSON.parse(JSON.stringify(exercise.richContent));
		payload.question = exercise.question;
		payload.responses = [...exercise.responses];
		payload.feedbacks = [...exercise.feedbacks];
	}
	return payload;
}

export function cloneExercise(exercise) {
	return {
		...exercise,
		...(exercise.richContent
			? { richContent: JSON.parse(JSON.stringify(exercise.richContent)) }
			: {}),
		skills: [...exercise.skills],
		classGroups: [...(exercise.classGroups ?? [])],
		responses: [...exercise.responses],
		feedbacks: [...exercise.feedbacks]
	};
}

export function flattenSkillAreas(skillAreas = [], { preserveNames = false } = {}) {
	const byName = new Map();
	for (const area of skillAreas) {
		for (const skill of area.skills ?? []) {
			const name = String(skill.name ?? '')
				.trim()
				.toLowerCase();
			if (!name) continue;
			byName.set(name, {
				id: skill.id,
				name: preserveNames ? String(skill.name).trim() : name,
				area: area.name ?? ''
			});
		}
	}
	return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function validateExercise(exercise) {
	const errors = [];
	if (!exercise.skills.length)
		errors.push(
			validationIssue(
				'skills',
				'Add at least one skill.',
				'Choose one or more skills from the shared skill pool.'
			)
		);
	if (!exercise.shortName.trim())
		errors.push(
			validationIssue(
				'shortname',
				'Enter a short name.',
				'Use a short unique label for this exercise.'
			)
		);
	if (!exercise.questionType.trim())
		errors.push(
			validationIssue(
				'type',
				'Select an exercise type.',
				'Choose exact answer, model answer, or multiple choice.'
			)
		);
	if (!exercise.question.trim())
		errors.push(
			validationIssue(
				'question',
				'Enter the question text.',
				'Add the learner-facing question or prompt.'
			)
		);
	if (!exercise.responses.length)
		errors.push(
			validationIssue(
				'responses',
				'Add at least one response.',
				'Add the answer or model response.'
			)
		);

	if (exercise.questionType === 'exact answer' && exercise.responses.length !== 1) {
		errors.push(
			validationIssue(
				'responses',
				'Exact-answer exercises must have exactly one response.',
				'Keep only the single accepted answer.'
			)
		);
	}
	if (exercise.questionType === 'multiple choice' && exercise.responses.length < 2) {
		errors.push(
			validationIssue(
				'responses',
				'Multiple-choice exercises must have at least two responses.',
				'Add at least one correct and one incorrect option.'
			)
		);
	}
	if (exercise.questionType === 'multiple choice' && exercise.feedbacks.length === 0) {
		errors.push(
			validationIssue(
				'feedbacks',
				'Multiple-choice exercises require feedback.',
				'Add feedback for every answer option.'
			)
		);
	}
	if (exercise.feedbacks.length > 0 && exercise.feedbacks.length !== exercise.responses.length) {
		errors.push(
			validationIssue(
				'feedbacks',
				'Feedback must match the number of responses.',
				'Add or remove feedback so every answer has one feedback item.'
			)
		);
		errors.push(
			validationIssue(
				'responses',
				'Response count must match the number of feedback items.',
				'Add or remove responses so every response has one feedback item.'
			)
		);
	}
	return errors;
}

export function validationIssue(field, message, suggested_fix = '') {
	return { field, message, suggested_fix };
}

export function issueMessages(issues = []) {
	return issues.map((issue) => (typeof issue === 'string' ? issue : issue.message));
}

export function exerciseHasIssues(exercise, issues = {}) {
	return (issues?.[exercise.id] ?? []).length > 0;
}

export function partitionExercisesByIssues(exercises = [], issues = {}) {
	const withIssues = [];
	const withoutIssues = [];
	for (const exercise of exercises) {
		if (exerciseHasIssues(exercise, issues)) {
			withIssues.push(exercise);
		} else {
			withoutIssues.push(exercise);
		}
	}
	return { withIssues, withoutIssues };
}

// The library screen loads this many exercises at a time, and the server sends no more
// in one response (exercise_page in python/library_service.py,
// docs/plans/library_paging_plan.md): a refresh after a write fetches a page at a time.
export const EXERCISE_PAGE_SIZE = 50;
export const MAX_EXERCISE_PAGE = 50;
const FILTER_KEYS = [
	'skill',
	'skillQuery',
	'type',
	'classGroup',
	'source',
	'phrase',
	'assignedOnly',
	'owner'
];
// Filters set by typing, which wait for a pause before the library is asked again.
const TYPED_FILTERS = ['phrase', 'skillQuery'];

/**
 * The filters as the server takes them: only the ones set. The library screen sends
 * these with every request, and the server applies them as filterExercises does
 * (exercise_matches in python/library_service.py).
 */
export function serverFilters(filters = {}) {
	return Object.fromEntries(
		FILTER_KEYS.filter((key) => !['', null, undefined, false].includes(filters[key])).map((key) => [
			key,
			filters[key]
		])
	);
}

/** Whether two sets of server filters differ only in what was typed. */
export function onlyTypingChanged(before = {}, after = {}) {
	return FILTER_KEYS.filter((key) => !TYPED_FILTERS.includes(key)).every(
		(key) => before[key] === after[key]
	);
}

/**
 * The screen's filters applied to a list it holds whole: a poll's question picker.
 * The library screen has the server filter the whole library instead (serverFilters).
 */
export function filterExercises(exercises = [], filters = {}) {
	const skillQuery = String(filters.skillQuery ?? '')
		.trim()
		.toLowerCase();
	const skill = String(filters.skill ?? '')
		.trim()
		.toLowerCase();
	const type = String(filters.type ?? '')
		.trim()
		.toLowerCase();
	const classGroup = String(filters.classGroup ?? '').trim();
	const phrase = String(filters.phrase ?? '')
		.trim()
		.toLowerCase();
	return exercises.filter((exercise) => {
		const matchesSkill =
			!skill || exercise.skills.some((exerciseSkill) => exerciseSkill.toLowerCase() === skill);
		const matchesSkillQuery =
			!skillQuery ||
			exercise.skills.some((exerciseSkill) => exerciseSkill.toLowerCase().includes(skillQuery));
		const matchesType = !type || exercise.questionType.toLowerCase() === type;
		const matchesClassGroup =
			!classGroup ||
			(exercise.classGroups ?? []).some((group) => String(group.group_id) === classGroup);
		const matchesSource =
			!filters.source ||
			(filters.source === 'none' ? !exercise.source : exercise.source === filters.source.slice(6));
		return (
			matchesSource &&
			matchesSkill &&
			matchesSkillQuery &&
			matchesType &&
			matchesClassGroup &&
			(!filters.assignedOnly || exercise.assigned) &&
			(filters.owner !== 'none' || !exercise.owner) &&
			(!phrase || exercise.question.toLowerCase().includes(phrase))
		);
	});
}

export function classGroupLabel(group) {
	if (!group) return '';
	const module = group.module_name ? ` - ${group.module_name}` : '';
	const status = group.status === 'inactive' ? ' - inactive' : '';
	return `${group.group_name}${module}${status}`;
}

export function classGroupFilterOptions(exercises = []) {
	const byId = new Map();
	for (const exercise of exercises) {
		for (const group of exercise.classGroups ?? []) {
			if (group.group_id == null) continue;
			byId.set(String(group.group_id), group);
		}
	}
	return [...byId.values()].sort((a, b) => classGroupLabel(a).localeCompare(classGroupLabel(b)));
}

export function noticeFromResult(result = {}, fallbackMessage = '') {
	const message = result?.message || fallbackMessage;
	if (!message) return null;
	return { type: 'success', message };
}

export function noticeFromError(error, fallbackMessage = 'Request failed.') {
	return {
		type: 'error',
		message: error?.body?.message || error?.message || String(error || fallbackMessage)
	};
}

export function warningNotice(message) {
	return message ? { type: 'warning', message } : null;
}

export function formatImportIssueRows(rows = []) {
	return rows.map((row) => ({
		row: row.row ?? '',
		shortName: row.shortname ?? row.shortName ?? '',
		issues: normaliseIssueObjects(row.issues?.length ? row.issues : [{ message: row.reason }])
	}));
}

export function capitaliseWords(value = '') {
	return value
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ')
		.trim();
}

function normaliseList(value) {
	if (Array.isArray(value)) return value.map((item) => String(item));
	if (typeof value === 'string' && value.trim()) return value.split('\n');
	return [];
}

function normaliseClassGroups(value) {
	if (!Array.isArray(value)) return [];
	return value.map((group) => ({
		group_id: group.group_id ?? null,
		group_name: group.group_name ?? '',
		module_name: group.module_name ?? '',
		status: group.status ?? 'active'
	}));
}

function normaliseIssueObjects(issues = []) {
	return issues.map((issue) => {
		if (typeof issue === 'string') {
			return { field: '', message: issue, suggested_fix: '' };
		}
		return {
			field: issue?.field ?? '',
			message: issue?.message ?? '',
			suggested_fix: issue?.suggested_fix ?? issue?.suggestedFix ?? ''
		};
	});
}
