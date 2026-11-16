// Sample practice items, in the shapes the Stars API returns them: exemplars from
// GET /exemplars/practice, exercises from POST /skills/get-random-exercises (after
// exerciseFromDto).

const item = (id, question, answer, feedback) => ({ id, question, answer, feedback });

const checklist = [
	item(1, 'Does the answer say what a pointer holds?', 'yes', 'It says the pointer holds the address of the node.'),
	item(2, 'Does it explain why the order of the two assignments matters?', 'no', 'It never says what goes wrong if the head is moved first: the rest of the list is lost.'),
	item(3, 'Does it handle the empty list?', 'yes', 'The last sentence covers a NULL head.'),
	item(4, 'Does it free memory that is no longer used?', 'n/a', 'Inserting allocates; nothing is removed, so there is nothing to free.')
];

const exemplar = (id, title, content, answers) => ({
	id,
	artefact_id: 300 + id,
	content_version: String(id).repeat(64).slice(0, 64),
	title,
	content,
	files: [],
	credits: { author: 'A Year 2 student', reviewer: 'Dr Byrne' },
	checklist: checklist.map(({ id, question }) => ({ id, question, answer: null, status: 'active' })),
	authoritative_checklist: checklist.map((c) => ({ ...c, answer: answers[c.id - 1] ?? c.answer })),
	skills: [{ id: 2, name: 'Pointers' }]
});

export const exemplars = [
	exemplar(
		1,
		'Inserting at the head of a linked list',
		'To insert at the head, I create a new node, point its `next` at the current head, and then make the new node the head.\n\nThis works for an empty list too, because the head is then `NULL` and the new node simply becomes the only node.',
		[]
	),
	exemplar(
		2,
		'Deleting a node',
		'I walk the list keeping a pointer to the previous node. When I find the value, I point `previous->next` past it.\n\nIf the node is the head, I move the head on instead.',
		['yes', 'n/a', 'no', 'no']
	),
	exemplar(
		3,
		'Reversing a list',
		'I keep three pointers: `previous`, `current` and `next`. On each step I save `current->next`, point `current->next` back at `previous`, then move all three on one place.',
		['yes', 'yes', 'yes', 'n/a']
	)
];

export const exercises = [
	{
		id: 42,
		contentVersion: 'a'.repeat(64),
		questionType: 'multiple choice',
		skills: ['pointers'],
		question: 'After int *p = &x;, what does *p give you?',
		richContent: { question: 'After `int *p = &x;`, what does `*p` give you?' },
		responses: ['The address of x', 'The value stored in x', 'The address of p', 'A copy of p'],
		answer: 'The value stored in x',
		feedback: '`*p` follows the pointer to `x`, so it reads the value stored there; `p` on its own is the address.'
	},
	{
		id: 43,
		contentVersion: 'b'.repeat(64),
		questionType: 'exact answer',
		skills: ['pointers'],
		question: 'What value does a pointer that points nowhere hold in C? (One word.)',
		richContent: { question: 'What value does a pointer that points nowhere hold in C? *(One word.)*' },
		answer: 'NULL',
		feedback: ''
	}
];
