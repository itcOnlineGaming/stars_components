import { base } from '$app/paths';
import { getJson, postJson } from '$lib/fetch.js';

export async function plannedPractice(url) {
	const session = url.searchParams.get('practice_session');
	const journey = url.searchParams.get('plan_journey');
	const step = url.searchParams.get('plan_step');
	if (!session || !/^[1-9]\d*$/.test(journey ?? '') || !/^[1-9]\d*$/.test(step ?? ''))
		throw new Error('This practice-session link is incomplete. Return to your journey.');
	const api = `/learner/journeys/v2/${journey}/practice-plans/${step}`;
	const model = await getJson(api);
	const record = model.plan?.sessions.find((item) => item.id === session && !item.removed);
	if (!record) throw new Error('This session is unavailable. Return to your practice plan.');
	return { session, journey, step, api, model, record };
}

export function plannedPracticeHref(context, method, result = null) {
	if (result?.complete)
		return `${base}/journeys/v2/${context.journey}/practice-plan/${context.step}/`;
	const type = result?.method ?? method;
	const query = new URLSearchParams({
		practice_session: context.session,
		plan_journey: context.journey,
		plan_step: context.step
	});
	if (result) query.set(type === 'exercise' ? 'exercise' : 'exemplar', String(result.source_id));
	return `${base}/${type === 'exercise' ? 'practise-exercises' : 'practise-exemplars'}/?${query}`;
}

export async function beginPlannedPractice(context, method, mode = 'random', count = undefined) {
	// Resume always uses the server's saved set, irrespective of the current selector.
	const result = context.record.started_at
		? await getJson(`/learner/practice-sessions/${context.session}/resume`)
		: await postJson(`${context.api}/start`, {
				session_id: context.session,
				method,
				selection_mode: mode,
				...(count === undefined ? {} : { count }),
				revision: context.model.plan.revision
		  });
	return plannedPracticeHref(context, method, result);
}
