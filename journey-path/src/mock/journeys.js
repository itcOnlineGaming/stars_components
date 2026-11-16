// Sample journeys for the mockup, in the shape the learner journey page gets from
// GET /learner/journeys/v2/<id> (the steps) and GET /api/learner/journey-progress/v2
// (one progress record per step: status, details, and whether it is locked).

const inDays = (days) => new Date(Date.now() + days * 86400000).toISOString();

const step = (journey_step_id, step_kind, title, config = {}) => ({
	journey_step_id,
	stable_key: `step-${journey_step_id}`,
	step_kind,
	title,
	config
});

const pointers = [
	step(1, 'resource', 'Watch: what is a pointer?', { url: 'https://example.com/video' }),
	step(2, 'practice', 'Practise pointers', {
		practice_type: 'practice_url',
		url: '/stars/practise-exercises/?skills=pointers'
	}),
	step(3, 'view_brief', 'Read the linked list brief', { brief_id: 5, brief_title: 'Linked lists' }),
	step(4, 'submit_response', 'Submit your linked list', { brief_id: 5, brief_title: 'Linked lists' }),
	step(5, 'self_evaluation', 'Review your own work', { brief_id: 5, brief_title: 'Linked lists' }),
	step(6, 'peer_review', "Review a classmate's work", { brief_id: 5, brief_title: 'Linked lists' }),
	step(7, 'read_reviews', 'Read your reviews', { brief_id: 5, brief_title: 'Linked lists' }),
	step(8, 'practice_plan', 'Plan your practice', { skill_id: 2 }),
	step(9, 'reflection', 'Reflect on your progress', { prompt_group_name: 'Weekly check-in' }),
	step(10, 'milestone', 'Pointers mastery', {
		target_type: 'skill_mastery',
		skill_id: 2,
		skill_name: 'Pointers',
		target_level: 4,
		due_at: inDays(1)
	})
];

const done = (details = {}) => ({ status: 'completed', details });
const started = (details = {}) => ({ status: 'in_progress', details });
const notStarted = (details = {}) => ({ status: 'not_started', details });
// Locked until the learner completes another step (its id and title).
const lockedBy = (id, title, record) => ({
	...record,
	locked: true,
	locked_by: { journey_step_id: id, title }
});

export const scenarios = [
	{
		id: 'midway',
		label: 'Part way through',
		journey: { title: 'Pointers and memory', description: 'Work with pointers and dynamic memory in C.' },
		steps: pointers,
		progress: {
			1: done({ visited: true }),
			2: done(),
			3: done(),
			4: done(),
			5: done(),
			6: started(),
			7: started({ unseen_reviews: 2 }),
			8: started({ sessions_completed: 1, sessions_required: 3, plan_status: { state: 'off_track' } }),
			9: lockedBy(6, "Review a classmate's work", notStarted()),
			10: started({ average_level: 2 })
		}
	},
	{
		id: 'start',
		label: 'Just started',
		journey: { title: 'Pointers and memory', description: 'Work with pointers and dynamic memory in C.' },
		steps: pointers,
		progress: {
			...Object.fromEntries(pointers.map((s) => [s.journey_step_id, notStarted()])),
			5: lockedBy(4, 'Submit your linked list', notStarted()),
			6: lockedBy(4, 'Submit your linked list', notStarted()),
			10: notStarted({ average_level: 0 })
		}
	},
	{
		id: 'done',
		label: 'Finished',
		journey: { title: 'Pointers and memory', description: 'Work with pointers and dynamic memory in C.' },
		steps: pointers,
		progress: {
			...Object.fromEntries(pointers.map((s) => [s.journey_step_id, done()])),
			8: done({ sessions_completed: 3, sessions_required: 3, plan_status: { state: 'on_track' } }),
			10: done({ average_level: 4 })
		}
	},
	{
		id: 'long',
		label: 'Long journey (two briefs, two milestones)',
		journey: { title: 'Data structures', description: 'Lists, stacks and queues, over six weeks.' },
		steps: [
			...pointers,
			step(11, 'view_brief', 'Read the stack brief', { brief_id: 6, brief_title: 'Stacks' }),
			step(12, 'submit_response', 'Submit your stack', { brief_id: 6, brief_title: 'Stacks' }),
			step(13, 'ai_evaluation', 'Ask for AI feedback', { brief_id: 6, brief_title: 'Stacks' }),
			step(14, 'revision_plan', 'Plan your revision', { brief_id: 6, brief_title: 'Stacks' }),
			step(15, 'milestone', 'Stack checklist', { target_type: 'brief_checklist', brief_id: 6, due_at: inDays(-2) })
		],
		progress: {
			...Object.fromEntries(pointers.map((s) => [s.journey_step_id, done()])),
			8: done({ sessions_completed: 3, sessions_required: 3, plan_status: { state: 'on_track' } }),
			10: done({ average_level: 4 }),
			11: done(),
			12: started(),
			13: notStarted(),
			14: lockedBy(13, 'Ask for AI feedback', notStarted()),
			15: started({
				requirements: [
					{ label: 'Push and pop', completed: true },
					{ label: 'Peek', completed: true },
					{ label: 'Handles an empty stack', completed: false },
					{ label: 'Tests', completed: false },
					{ label: 'Comments', completed: false }
				]
			})
		}
	}
];
