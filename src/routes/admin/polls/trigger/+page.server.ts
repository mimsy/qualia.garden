// ABOUTME: Poll trigger page handler.
// ABOUTME: Creates polls and dispatches jobs to the queue.

import { fail, redirect } from '@sveltejs/kit';
import { getQuestions, getModels, createPoll } from '$lib/db/queries';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return { questions: [], models: [] };
	}

	const [questions, models] = await Promise.all([
		getQuestions(platform.env.DB, { status: 'published' }),
		getModels(platform.env.DB, true)
	]);

	return { questions, models };
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { error: 'Database not available' });
		}

		if (!platform?.env?.POLL_QUEUE) {
			return fail(500, { error: 'Queue not available' });
		}

		const formData = await request.formData();
		const questionId = formData.get('question_id') as string;
		const modelIds = formData.getAll('model_ids') as string[];

		if (!questionId) {
			return fail(400, { error: 'Please select a question' });
		}

		if (modelIds.length === 0) {
			return fail(400, { error: 'Please select at least one model' });
		}

		const db = platform.env.DB;
		const queue = platform.env.POLL_QUEUE;

		// Create polls and queue jobs
		const jobs: Array<{ poll_id: string; question_id: string; model_id: string }> = [];

		for (const modelId of modelIds) {
			const poll = await createPoll(db, {
				question_id: questionId,
				model_id: modelId
			});

			jobs.push({
				poll_id: poll.id,
				question_id: questionId,
				model_id: modelId
			});
		}

		// Send all jobs to queue
		await queue.sendBatch(jobs.map((job) => ({ body: job })));

		throw redirect(303, '/admin/polls');
	}
};
