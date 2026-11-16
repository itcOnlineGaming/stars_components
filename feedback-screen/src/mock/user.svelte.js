// Stand-in for Stars's signed-in user ($lib/user.svelte.js): a learner in one class.
export const user = $state({
	id: 1,
	username: 'Aoife Byrne',
	role: 'student',
	current_group_id: 10
});

export const roleOverride = $state({ active: null });
