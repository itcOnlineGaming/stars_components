// The answers the pretend server gives, keyed by "METHOD /path". The shapes follow the
// Stars API; availability numbers are made up.
import { scenarios } from './scenarios.js';

const assignment = () => scenarios[0].props.journeyContext.assignment;
const fixed = () => scenarios[1].props.journeyContext.assignment;

// Per skill id. Arrays: every exercise seen. Recursion: too few for a full set.
const options = {
	2: { exercise: { total: 10, unseen: 6 }, exemplar: { total: 8, unseen: 8 } },
	1: { exercise: { total: 8, unseen: 0 }, exemplar: { total: 4, unseen: 4 } },
	3: { exercise: { total: 3, unseen: 3 }, exemplar: { total: 0, unseen: 0 } }
};

export const routes = {
	// The skills in the learner's class (free practice).
	'POST /skills/get-skill-masteries': () => ({
		skill_areas: [
			{
				id: 1,
				name: 'Programming',
				skills: [
					{ id: 2, name: 'pointers', mastery: 0.4 },
					{ id: 1, name: 'arrays', mastery: 0.7 },
					{ id: 3, name: 'recursion', mastery: 0.1 }
				]
			}
		]
	}),
	// How many items there are for a skill (free practice and practice plans).
	'GET /practice/options': ({ query }) =>
		options[query.get('skill_id')] ?? { exercise: { total: 0, unseen: 0 }, exemplar: { total: 0, unseen: 0 } },
	// A journey step's practice assignment, for the skill and type chosen so far.
	'GET /learner/journeys/v2/1/practice/11': ({ query }) => {
		const base = query.has('skill_id') || query.has('method') ? assignment() : fixed();
		return { ...base, options: options[query.get('skill_id') ?? base.skill_id] ?? base.options };
	},
	// Starting the set: the server freezes the choices and returns them.
	'POST /learner/journeys/v2/1/practice/11/start': ({ body }) => ({
		...assignment(),
		...body,
		method: body.method ?? 'exercise',
		mode: body.mode ?? 'random',
		skill_id: body.skill_id ?? 2,
		selection_id: 'mockup-selection'
	}),
	// Starting a practice plan session.
	'POST /learner/journeys/v2/1/practice-plans/20/start': ({ body }) => ({
		method: body.method,
		source_id: body.method === 'exercise' ? 42 : 123,
		complete: false
	})
};
