import { getJson, postJson } from '$lib/fetch.js';
import { base } from '$app/paths';

function practiceUrl(context, result) {
	const query = new URLSearchParams({
		journey_practice: String(context.journey),
		journey_step: String(context.step),
		skill_ids: String(result.skill_id),
		mode: result.mode,
		selection: result.selection_id,
		start: '1',
		return: `${base}/journeys/v2/${context.journey}/`
	});
	return `${base}/practise-${result.method === 'exercise' ? 'exercises' : 'exemplars'}/?${query}`;
}

export async function beginJourneyPractice(context, choices = null) {
	// Another round returns to setup when choices are available. Resolve current
	// defaults afresh; a previously started set keeps its own frozen settings.
	if (choices === null && Object.values(context.assignment.controls ?? {}).some(Boolean)) {
		const assignment = await getJson(context.endpoint);
		const query = new URLSearchParams({
			journey_practice: String(context.journey),
			journey_step: String(context.step)
		});
		return `${base}/practise-${
			assignment.method === 'exercise' ? 'exercises' : 'exemplars'
		}/?${query}`;
	}
	const result = await postJson(`${context.endpoint}/start`, choices ?? {});
	return practiceUrl(context, result);
}

/** Journey parameters identify an assignment; all settings come from the server. */
export async function assignedJourneyPractice(url, expectedMethod) {
	const journey = url.searchParams.get('journey_practice');
	const step = url.searchParams.get('journey_step');
	if (journey === null && step === null) return null;
	if (
		![journey, step].every((id) => /^[1-9]\d*$/.test(id ?? '') && Number.isSafeInteger(Number(id)))
	)
		throw new Error('This Journey practice link is invalid. Return to the Journey.');
	const endpoint = `/learner/journeys/v2/${journey}/practice/${step}`;
	let assignment = await getJson(endpoint);
	const selection = url.searchParams.get('selection');
	if (!selection && assignment.method !== expectedMethod)
		throw new Error(
			'This practice type does not match the assigned Journey step. Return to the Journey.'
		);
	const context = { journey, step, endpoint, assignment };
	const started = !!selection || assignment.instant_start;
	if (started) {
		assignment = await postJson(`${endpoint}/start`, selection ? { selection_id: selection } : {});
		context.assignment = assignment;
	}
	if (assignment.method !== expectedMethod)
		throw new Error(
			'This practice type does not match the assigned Journey step. Return to the Journey.'
		);
	return {
		journeyContext: context,
		entry: !started,
		requestedSkillId: assignment.skill_id,
		requestedSkill: assignment.skill_name,
		selectionMode: assignment.mode,
		selectionId: assignment.selection_id ?? null,
		autoStart: started,
		journeyReturn: `${base}/journeys/v2/${journey}/`
	};
}
