// The answers the pretend server gives, keyed by "METHOD /path". The shapes follow the
// Stars API; the marking is simplified.
import { exercises } from './practice.js';

export const routes = {
	// Saving an exemplar review. Stars scores it and returns what it saved.
	'POST /update-learner-model': ({ body }) => ({
		attempt_id: 700,
		score: 1,
		scored: true,
		message: 'success',
		submitted_payload: body
	}),
	// Answering a multiple choice or exact answer exercise.
	'POST /skills/correct-response': ({ body }) => {
		const exercise = exercises.find((e) => e.id === body.id);
		const correct = body.response?.trim().toLowerCase() === exercise.answer.toLowerCase();
		return {
			correct,
			message: correct ? 'Correct' : 'Incorrect',
			formatted_result: { solution: exercise.answer, feedback: exercise.feedback },
			submitted_payload: body
		};
	},
	// "Flag as incorrect" on a feedback item.
	'POST /content-flags': () => ({ id: 1, status: 'open' })
};
