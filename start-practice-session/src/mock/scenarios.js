// The ways a learner reaches the start practice session screen, as the props PracticeEntry gets
// from the practise-exercises / practise-exemplars pages, plus the journey step's
// practice assignment the server returns (GET /learner/journeys/v2/<id>/practice/<step>).

const journeyAssignment = (overrides) => ({
	method: 'exercise',
	mode: 'random',
	skill_id: 2,
	skill_name: 'Pointers',
	instant_start: false,
	controls: { skill: true, method: true, mode: true, count: true },
	allowed_methods: ['exercise', 'exemplar'],
	allowed_modes: ['random', 'unseen'],
	skills: [
		{ id: 2, name: 'pointers' },
		{ id: 1, name: 'arrays' }
	],
	set_sizes: { exercise: 5, exemplar: 3 },
	count: 5,
	count_bounds: { min: 1, max: 7 },
	requirements: {
		exercise: { required: 5, completed: 2, remaining: 3 },
		exemplar: { required: 3, completed: 0, remaining: 3 }
	},
	options: { exercise: { total: 10, unseen: 6 }, exemplar: { total: 8, unseen: 8 } },
	...overrides
});

const journeyContext = (assignment) => ({
	journey: '1',
	step: '11',
	endpoint: '/learner/journeys/v2/1/practice/11',
	assignment
});

export const scenarios = [
	{
		id: 'journey-choice',
		label: 'Journey step: the learner chooses',
		props: { journeyContext: journeyContext(journeyAssignment({})) }
	},
	{
		id: 'journey-fixed',
		label: 'Journey step: all set by the teacher',
		props: {
			journeyContext: journeyContext(
				journeyAssignment({
					controls: { skill: false, method: false, mode: false, count: false },
					allowed_methods: ['exercise'],
					allowed_modes: ['random'],
					skills: [{ id: 2, name: 'pointers' }],
					requirements: { exercise: { required: 5, completed: 2, remaining: 3 } }
				})
			)
		}
	},
	{
		id: 'free',
		label: 'Free practice (opened from the menu)',
		props: { initialMethod: 'exercise' }
	},
	{
		id: 'planned',
		label: 'A session from a practice plan',
		props: {
			plannedContext: {
				session: 'b',
				journey: '1',
				step: '20',
				api: '/learner/journeys/v2/1/practice-plans/20',
				record: { id: 'b', started_at: null },
				model: { config: { skill_id: 2 }, skill_name: 'pointers', plan: { revision: 1 } }
			}
		}
	}
];
