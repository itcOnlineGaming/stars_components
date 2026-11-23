export interface ChecklistItem {
	id?: number;
	question: string;
	answer?: string;
	feedback?: string;
	correctAnswer?: string; //todo: move to exemplar
	correct?: boolean; //todo: move to exemplar
	status: 'active' | 'future' | 'done' | null;
	order_index?: number;
	section_name?: string;
	// False when the item is not on the brief's checklist (an exemplar's or a review's
	// item the brief has dropped, or never had); see arrange_by_section.
	on_checklist?: boolean;
	update_source?: string;
	// Titles of live journey milestones that require this item of the learner; such
	// items are always active for them (see get_effective_checklist_items).
	required_by_milestones?: string[];
}

export type File = {
	name: string;
	fileType: string;
	url: string;
	newFile?: boolean;
	file?: globalThis.File | null;
};
export interface Artefact {
	team_revision?: number;
	share_key?: string;
	team_submission_id?: number;
	artefact_id: number; //todo: remove this and use id instead, but need to update backend first
	id: number;
	title: string;
	brief_title: string;
	checklist: ChecklistItem[];
	checklist_items?: ChecklistItem[]; //todo: remove this, but need to update backend first (which of these two fields to keep is a bit tricky as they are both used in different places, need to standardise on one)
	content: string | null;
	cover_letter?: string;
	files: File[];
	createdAt: string;
	created?: string;
	exemplar_id?: number;
	submission_number?: number;
	authorName: string;
	author_id: number;
	meta: {};
	brief_version_id?: number;

	reviews: any[] | null;
	simplified_workflow?: boolean;
	show_cover_letter?: boolean;
	verification_status?: string;
	authoritative_checklist?: ChecklistItem[];
	submitted?: boolean;
}

export interface Exemplar extends Artefact {
	content_version?: string;
	id: number;
	authoritative_checklist: ChecklistItem[];
	official_artefact_feedback_id: number;
	artefact_id: number;
	skills: any[];
	// Consent (#243): pending | accepted | declined | consent_not_requested.
	status?: string | null;
	owner_id?: number | null;
	// Who students see credited, or null for an exemplar from before consent.
	credits?: { author: string | null; reviewer: string | null } | null;
	// What the work answers, written on an exemplar made without a brief (#312).
	task?: string | null;
	// Whether it was made from a brief (its checklist has the brief's sections).
	has_brief?: boolean;
	// Made directly by a teacher: their own work, so nobody was asked for consent.
	made_directly?: boolean;
}

export type NewArtefact = Partial<
	Pick<Artefact, 'title' | 'content' | 'files' | 'checklist' | 'meta'>
>;

// An artefact being authored: user-provided fields required, server-assigned fields optional.
export type PartialArtefact = Pick<Artefact, 'title' | 'content' | 'files' | 'checklist'> &
	Partial<Omit<Artefact, 'title' | 'content' | 'files' | 'checklist'>>;

export const emptyNewArtefact: NewArtefact = {
	title: '',
	content: '',
	files: [],
	checklist: [],
	meta: {}
};

export const emptyArtefact: Artefact = {
	id: 0,
	artefact_id: 0,
	title: '',
	brief_title: '',
	checklist: [],
	content: '',
	files: [],
	createdAt: '',
	authorName: '',
	author_id: 0,
	meta: {},
	reviews: null
};

export const buildArtefact = (artefactData: any): Artefact => {
	return {
		id: artefactData.id,
		team_revision: artefactData.team_revision,
		share_key: artefactData.share_key,
		team_submission_id: artefactData.team_submission_id,
		title: artefactData.title,
		content: artefactData.content,
		cover_letter: artefactData.cover_letter,
		createdAt: artefactData.created,
		authorName: artefactData.author_name,
		author_id: artefactData.author_id,
		checklist: artefactData.checklist,
		files: artefactData.files, //todo: fix URL here
		reviews: artefactData.reviews,
		brief_title: artefactData.brief_title,
		brief_version_id: artefactData.brief_version_id,
		simplified_workflow: artefactData.simplified_workflow,
		show_cover_letter: artefactData.show_cover_letter,
		artefact_id: artefactData.artefact_id ?? artefactData.id,
		meta: artefactData.meta ?? {}
	};
};

export const buildExemplar = (exemplarData: any): Exemplar => {
	const artefact = buildArtefact(exemplarData);

	//TODO:
	//check that the two checklists have same items in same order
	//throw error if not
	return {
		...artefact,
		exemplar_id: exemplarData.id,
		id: exemplarData.id,
		content_version: exemplarData.content_version,
		authoritative_checklist: exemplarData.authoritative_checklist,
		official_artefact_feedback_id: exemplarData.official_artefact_feedback_id,
		artefact_id: exemplarData.artefact_id,
		skills: exemplarData.skills,
		status: exemplarData.status ?? null,
		owner_id: exemplarData.owner_id ?? null,
		credits: exemplarData.credits ?? null,
		task: exemplarData.task ?? null,
		has_brief: exemplarData.has_brief ?? true,
		made_directly: exemplarData.made_directly ?? false
	};
};

export interface Skill {
	skill_id?: number;
	id: number; //TODO which id to use? need to standardise on one,
	name: string;
	domain_id?: number | null;
	domain_name?: string | null;
	// The stars app library area the skill is filed in (ADR-011); what teachers browse by.
	area_id?: number | null;
	area_name?: string | null;
}

export interface RequirementTemplate {
	id: string;
	description: string;
}

export interface Requirement {
	id: string;
	brief_id: string;
	description: string;
	status: 'future' | 'active' | 'complete' | 'failed';
	section_name: string;
}

export interface Brief {
	deadline_at?: string | null;
	submission_mode?: string;
	team_context?: any;
	id: string;
	version: number;
	title: string;
	content: string;
	requirements: Requirement[];
	brief_version_id: number;
	checklist_items: ChecklistItem[];
	version_number: number;
	checklist_mutable: boolean;
	allow_multiple_responses: boolean;
	simplified_workflow: boolean;
	show_cover_letter: boolean;
	allow_text_response: boolean;
	allow_file_response: boolean;
	parent_brief_id?: number;
}

export interface Review {
	id: number;
	reviewer_id: number;
	reviewer_name: string;
	reviewer_role: string;
	created: string;
	is_authoritative: boolean;
	score: number;
	overall_comment: string | null;
	checklist: ChecklistItem[];
}

export interface FeedbackItem {
	reviewerId: number;
	reviewerName: string;
	reviewerRole: string;
	answer: string;
	feedback: string;
	artefactFeedbackId: number;
	checklistItemId: number;
}

export interface GroupedFeedback {
	checklistItemId: number;
	question: string;
	section_name?: string;
	feedbackItems: FeedbackItem[];
}

export interface Group {
	uses_teams?: boolean;
	group_id: number;
	group_name: string;
	group_code: string;
}

export interface User {
	[key: string]: unknown;
	id: string | null;
	email: string | null;
	username: string | null;
	forename: string | null;
	surname: string | null;
	avatar_url: string | null;
	auth_provider: string | null;
	auth_provider_id: string | null;
	token: string | null;
	role: 'teacher' | 'admin' | 'student' | null;
	api_id: number | null;
	consent_signed: boolean | null;
	groups: Group[];
	current_group_id: number | null;
}

export interface PromptConfig {
	NUM_GENERATE: number;
	MIN_APPROVE: number | null;
}

export interface ArtefactMeta {
	saved: boolean;
	hasContent: boolean;
	hasActiveGoals: boolean;
	hasSelfReviewed: boolean;
	hasRequestedFeedback: boolean;
	isSubmitted: boolean;
}

export interface RevisionPlanItem {
	id: number;
	artefact_id: number;
	artefact_feedback_id: number;
	checklist_item_id: number;
	feedback_text: string;
	student_comment: string;
	status: 'pending' | 'in_progress' | 'completed';
	display_order: number;
	created: string;
	updated: string;
	// Joined data for display
	checklist_question?: string;
	reviewer_name?: string;
	reviewer_role?: string;
	brief_id?: number;
}
