// ABOUTME: Admin responses page showing all poll batches with filtering and retry.
// ABOUTME: Groups polls by batch_id, supports pagination and status filtering.

import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { createPoll, getPoll } from '$lib/db/queries';

interface PollRow {
	poll_id: string;
	batch_id: string | null;
	question_id: string;
	model_id: string;
	status: string;
	created_at: string;
	question_text: string;
	category: string | null;
	model_name: string;
	model_family: string;
	parsed_answer: string | null;
	justification: string | null;
	error: string | null;
	response_time_ms: number | null;
}

interface Sample {
	poll_id: string;
	parsed_answer: string | null;
	justification: string | null;
	error: string | null;
	response_time_ms: number | null;
	status: string;
}

interface BatchInfo {
	id: string;
	question_id: string;
	question_text: string;
	category: string | null;
	model_id: string;
	model_name: string;
	model_family: string;
	samples: Sample[];
	status: 'pending' | 'complete' | 'failed' | 'partial';
	complete_count: number;
	failed_count: number;
	pending_count: number;
	created_at: string;
}

const PAGE_SIZE = 20;

export const load: PageServerLoad = async ({ url, platform, locals }) => {
	const isPreview = url.host.includes('.pages.dev') && url.host !== 'qualia-garden.pages.dev';
	const isAdmin = dev || isPreview || locals.user?.isAdmin;

	if (!isAdmin) {
		return error(403, 'Admin access required');
	}

	if (!platform?.env?.DB) {
		return error(500, 'Database not available');
	}

	const db = platform.env.DB;

	// Parse URL params
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
	const statusFilter = url.searchParams.get('status') || 'all';

	// Build status filter clause
	const statusClause = statusFilter !== 'all' ? `WHERE p.status = ?` : '';
	const statusParams = statusFilter !== 'all' ? [statusFilter] : [];

	// Get total count for pagination
	const countResult = await db
		.prepare(
			`SELECT COUNT(DISTINCT COALESCE(p.batch_id, p.id)) as count
			FROM polls p
			${statusClause}`
		)
		.bind(...statusParams)
		.first<{ count: number }>();

	const totalBatches = countResult?.count || 0;
	const totalPages = Math.ceil(totalBatches / PAGE_SIZE);

	// Fetch polls with related data
	// We need to get all polls first, then group by batch in JS
	// Using a window function approach for pagination on batches is complex,
	// so we'll fetch more than needed and limit in JS
	const result = await db
		.prepare(
			`SELECT
				p.id as poll_id,
				p.batch_id,
				p.question_id,
				p.model_id,
				p.status,
				p.created_at,
				q.text as question_text,
				q.category,
				m.name as model_name,
				m.family as model_family,
				r.parsed_answer,
				r.justification,
				r.error,
				r.response_time_ms
			FROM polls p
			JOIN questions q ON p.question_id = q.id
			JOIN models m ON p.model_id = m.id
			LEFT JOIN responses r ON p.id = r.poll_id
			${statusClause}
			ORDER BY p.created_at DESC`
		)
		.bind(...statusParams)
		.all<PollRow>();

	// Group by batch_id (or poll_id if no batch)
	const batchMap = new Map<string, BatchInfo>();

	for (const row of result.results) {
		const key = row.batch_id || row.poll_id;

		if (!batchMap.has(key)) {
			batchMap.set(key, {
				id: key,
				question_id: row.question_id,
				question_text: row.question_text,
				category: row.category,
				model_id: row.model_id,
				model_name: row.model_name,
				model_family: row.model_family,
				samples: [],
				status: 'pending',
				complete_count: 0,
				failed_count: 0,
				pending_count: 0,
				created_at: row.created_at
			});
		}

		const batch = batchMap.get(key)!;
		batch.samples.push({
			poll_id: row.poll_id,
			parsed_answer: row.parsed_answer,
			justification: row.justification,
			error: row.error,
			response_time_ms: row.response_time_ms,
			status: row.status
		});

		// Update counts
		if (row.status === 'complete') batch.complete_count++;
		else if (row.status === 'failed') batch.failed_count++;
		else batch.pending_count++;
	}

	// Compute aggregate status for each batch
	for (const batch of batchMap.values()) {
		if (batch.pending_count > 0) {
			batch.status = 'pending';
		} else if (batch.failed_count > 0 && batch.complete_count > 0) {
			batch.status = 'partial';
		} else if (batch.failed_count > 0) {
			batch.status = 'failed';
		} else {
			batch.status = 'complete';
		}
	}

	// Convert to array and paginate
	const allBatches = Array.from(batchMap.values());
	const offset = (page - 1) * PAGE_SIZE;
	const batches = allBatches.slice(offset, offset + PAGE_SIZE);

	return {
		batches,
		pagination: {
			page,
			totalPages,
			totalBatches,
			pageSize: PAGE_SIZE
		},
		statusFilter,
		isAdmin
	};
};

export const actions: Actions = {
	retry: async ({ request, platform, locals, url }) => {
		const isPreview = url.host.includes('.pages.dev') && url.host !== 'qualia-garden.pages.dev';
		const isAdmin = dev || isPreview || locals.user?.isAdmin;

		if (!isAdmin) {
			return fail(403, { error: 'Admin access required' });
		}

		if (!platform?.env?.DB) {
			return fail(500, { error: 'Database not available' });
		}

		if (!platform?.env?.POLL_QUEUE) {
			return fail(500, { error: 'Queue not available' });
		}

		const formData = await request.formData();
		const pollId = formData.get('poll_id') as string;

		if (!pollId) {
			return fail(400, { error: 'Poll ID required' });
		}

		const db = platform.env.DB;
		const queue = platform.env.POLL_QUEUE;

		// Get the original poll to get question_id and model_id
		const poll = await getPoll(db, pollId);
		if (!poll) {
			return fail(404, { error: 'Poll not found' });
		}

		// Create a new poll for retry
		const newPoll = await createPoll(db, {
			question_id: poll.question_id,
			model_id: poll.model_id
		});

		// Queue the job
		await queue.send({
			poll_id: newPoll.id,
			question_id: poll.question_id,
			model_id: poll.model_id
		});

		// Preserve current page and status filter in redirect
		const currentPage = url.searchParams.get('page') || '1';
		const statusFilter = url.searchParams.get('status') || 'all';

		redirect(303, `/responses?page=${currentPage}&status=${statusFilter}`);
	}
};
