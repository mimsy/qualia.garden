// ABOUTME: Responses page showing latest poll batch per model-question pair.
// ABOUTME: Shows only current data, not superseded batches from retries.

import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { createPollBatch } from '$lib/db/queries';

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

	// Fetch only the latest batch for each (question_id, model_id) pair
	// First find the most recent poll for each pair, then get all polls from that batch
	const result = await db
		.prepare(
			`WITH latest_poll AS (
				SELECT question_id, model_id, MAX(created_at) as max_created
				FROM polls
				GROUP BY question_id, model_id
			),
			latest_batch_info AS (
				SELECT p.question_id, p.model_id, p.batch_id, p.id as poll_id
				FROM polls p
				JOIN latest_poll lp ON p.question_id = lp.question_id
					AND p.model_id = lp.model_id
					AND p.created_at = lp.max_created
			)
			SELECT
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
			WHERE m.active = 1
				AND EXISTS (
					SELECT 1 FROM latest_batch_info lb
					WHERE lb.question_id = p.question_id
						AND lb.model_id = p.model_id
						AND (
							(p.batch_id IS NOT NULL AND p.batch_id = lb.batch_id)
							OR (p.batch_id IS NULL AND p.id = lb.poll_id)
						)
				)
			ORDER BY p.created_at DESC`
		)
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

	// Convert to array and apply status filter
	let allBatches = Array.from(batchMap.values());

	// Apply status filter in JS (since batch status is computed)
	if (statusFilter !== 'all') {
		allBatches = allBatches.filter((batch) => {
			if (statusFilter === 'failed') {
				return batch.status === 'failed' || batch.status === 'partial';
			}
			return batch.status === statusFilter;
		});
	}

	// Pagination
	const totalBatches = allBatches.length;
	const totalPages = Math.ceil(totalBatches / PAGE_SIZE);
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
		const questionId = formData.get('question_id') as string;
		const modelId = formData.get('model_id') as string;
		const sampleCount = parseInt(formData.get('sample_count') as string, 10) || 1;
		const statusFilter = (formData.get('status_filter') as string) || 'all';
		const currentPage = (formData.get('current_page') as string) || '1';

		if (!questionId || !modelId) {
			return fail(400, { error: 'Question ID and Model ID required' });
		}

		const db = platform.env.DB;
		const queue = platform.env.POLL_QUEUE;

		// Create new polls for retry (same number as failed samples)
		const newPolls = await createPollBatch(db, {
			question_id: questionId,
			model_id: modelId,
			sample_count: sampleCount
		});

		// Queue all the jobs
		const jobs = newPolls.map((poll) => ({
			body: {
				poll_id: poll.id,
				question_id: questionId,
				model_id: modelId
			}
		}));
		await queue.sendBatch(jobs);

		// Build redirect URL preserving current filters
		const redirectUrl = new URL('/responses', 'http://localhost');
		if (statusFilter && statusFilter !== 'all') {
			redirectUrl.searchParams.set('status', statusFilter);
		}
		if (currentPage && currentPage !== '1') {
			redirectUrl.searchParams.set('page', currentPage);
		}

		redirect(303, redirectUrl.pathname + redirectUrl.search);
	}
};
