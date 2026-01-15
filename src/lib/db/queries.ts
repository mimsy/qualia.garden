// ABOUTME: D1 database query functions.
// ABOUTME: Provides CRUD operations for models, questions, polls, and responses.

import { nanoid } from 'nanoid';
import type { Model, Question, Poll, Response, PollStatus, QuestionStatus, Category } from './types';

// SQL filter for getting only the latest poll per model/question combination
// Handles both batched polls (multiple samples) and legacy single polls
export function getLatestPollFilter(pollAlias = 'p'): string {
	return `
		AND (
			(${pollAlias}.batch_id IS NOT NULL AND ${pollAlias}.batch_id = (
				SELECT p2.batch_id FROM polls p2
				WHERE p2.question_id = ${pollAlias}.question_id
					AND p2.model_id = ${pollAlias}.model_id
					AND p2.batch_id IS NOT NULL
				ORDER BY p2.created_at DESC
				LIMIT 1
			))
			OR
			(${pollAlias}.batch_id IS NULL AND ${pollAlias}.id = (
				SELECT p3.id FROM polls p3
				WHERE p3.question_id = ${pollAlias}.question_id
					AND p3.model_id = ${pollAlias}.model_id
					AND p3.batch_id IS NULL
				ORDER BY p3.created_at DESC
				LIMIT 1
			))
		)`;
}

// Models
export async function getModels(db: D1Database, activeOnly = true): Promise<Model[]> {
	const query = activeOnly
		? 'SELECT * FROM models WHERE active = 1 ORDER BY family, name'
		: 'SELECT * FROM models ORDER BY family, name';
	const result = await db.prepare(query).all<Model>();
	return result.results;
}

export async function getModel(db: D1Database, id: string): Promise<Model | null> {
	const result = await db.prepare('SELECT * FROM models WHERE id = ?').bind(id).first<Model>();
	return result;
}

export async function createModel(db: D1Database, data: Omit<Model, 'id' | 'created_at' | 'active'>): Promise<Model> {
	const id = nanoid(12);
	await db
		.prepare(
			'INSERT INTO models (id, name, family, openrouter_id, supports_reasoning, release_date, description) VALUES (?, ?, ?, ?, ?, ?, ?)'
		)
		.bind(
			id,
			data.name,
			data.family,
			data.openrouter_id,
			data.supports_reasoning ? 1 : 0,
			data.release_date ?? null,
			data.description ?? null
		)
		.run();
	return (await getModel(db, id))!;
}

export async function updateModel(
	db: D1Database,
	id: string,
	data: Partial<
		Pick<Model, 'name' | 'family' | 'openrouter_id' | 'active' | 'supports_reasoning' | 'release_date' | 'description'>
	>
): Promise<Model | null> {
	const sets: string[] = [];
	const values: unknown[] = [];

	if (data.name !== undefined) {
		sets.push('name = ?');
		values.push(data.name);
	}
	if (data.family !== undefined) {
		sets.push('family = ?');
		values.push(data.family);
	}
	if (data.openrouter_id !== undefined) {
		sets.push('openrouter_id = ?');
		values.push(data.openrouter_id);
	}
	if (data.active !== undefined) {
		sets.push('active = ?');
		values.push(data.active ? 1 : 0);
	}
	if (data.supports_reasoning !== undefined) {
		sets.push('supports_reasoning = ?');
		values.push(data.supports_reasoning ? 1 : 0);
	}
	if (data.release_date !== undefined) {
		sets.push('release_date = ?');
		values.push(data.release_date);
	}
	if (data.description !== undefined) {
		sets.push('description = ?');
		values.push(data.description);
	}

	if (sets.length === 0) return getModel(db, id);

	values.push(id);
	await db
		.prepare(`UPDATE models SET ${sets.join(', ')} WHERE id = ?`)
		.bind(...values)
		.run();
	return getModel(db, id);
}

export async function deleteModel(db: D1Database, id: string): Promise<boolean> {
	const result = await db.prepare('DELETE FROM models WHERE id = ?').bind(id).run();
	return result.meta.changes > 0;
}

export async function getFamilies(db: D1Database): Promise<string[]> {
	const result = await db.prepare('SELECT DISTINCT family FROM models ORDER BY family').all<{ family: string }>();
	return result.results.map((r) => r.family);
}

// Questions
export interface GetQuestionsOptions {
	status?: QuestionStatus | 'all';
}

export async function getQuestions(
	db: D1Database,
	options: GetQuestionsOptions = { status: 'published' }
): Promise<Question[]> {
	const whereClause = options.status && options.status !== 'all' ? `WHERE status = '${options.status}'` : '';
	const query = `SELECT * FROM questions ${whereClause} ORDER BY category, created_at DESC`;
	const result = await db.prepare(query).all<Question>();
	return result.results;
}

export async function getQuestion(db: D1Database, id: string): Promise<Question | null> {
	const result = await db.prepare('SELECT * FROM questions WHERE id = ?').bind(id).first<Question>();
	return result;
}

export async function getQuestionsByCategory(db: D1Database, category: string): Promise<Question[]> {
	const result = await db
		.prepare('SELECT * FROM questions WHERE category = ? AND active = 1 ORDER BY created_at')
		.bind(category)
		.all<Question>();
	return result.results;
}

export async function getUnpolledQuestionsForModel(db: D1Database, modelId: string): Promise<Question[]> {
	const result = await db
		.prepare(
			`SELECT q.*
			FROM questions q
			WHERE q.status = 'published'
				AND NOT EXISTS (
					SELECT 1 FROM polls p
					WHERE p.question_id = q.id AND p.model_id = ?
				)
			ORDER BY q.category, q.created_at`
		)
		.bind(modelId)
		.all<Question>();
	return result.results;
}

export async function createQuestion(
	db: D1Database,
	data: Pick<Question, 'text' | 'category' | 'response_type' | 'options'> &
		Partial<Pick<Question, 'benchmark_source_id' | 'benchmark_question_id' | 'status'>>
): Promise<Question> {
	const id = nanoid(12);
	await db
		.prepare(
			'INSERT INTO questions (id, text, category, response_type, options, status, benchmark_source_id, benchmark_question_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
		)
		.bind(
			id,
			data.text,
			data.category,
			data.response_type,
			data.options,
			data.status ?? 'draft',
			data.benchmark_source_id ?? null,
			data.benchmark_question_id ?? null
		)
		.run();
	return (await getQuestion(db, id))!;
}

export async function updateQuestion(
	db: D1Database,
	id: string,
	data: Partial<Pick<Question, 'text' | 'category' | 'response_type' | 'options' | 'active' | 'status'>>
): Promise<Question | null> {
	const sets: string[] = [];
	const values: unknown[] = [];

	if (data.text !== undefined) {
		sets.push('text = ?');
		values.push(data.text);
	}
	if (data.category !== undefined) {
		sets.push('category = ?');
		values.push(data.category);
	}
	if (data.response_type !== undefined) {
		sets.push('response_type = ?');
		values.push(data.response_type);
	}
	if (data.options !== undefined) {
		sets.push('options = ?');
		values.push(data.options);
	}
	if (data.active !== undefined) {
		sets.push('active = ?');
		values.push(data.active ? 1 : 0);
	}
	if (data.status !== undefined) {
		sets.push('status = ?');
		values.push(data.status);
	}

	if (sets.length === 0) return getQuestion(db, id);

	values.push(id);
	await db
		.prepare(`UPDATE questions SET ${sets.join(', ')} WHERE id = ?`)
		.bind(...values)
		.run();
	return getQuestion(db, id);
}

// Polls
export async function getPoll(db: D1Database, id: string): Promise<Poll | null> {
	const result = await db.prepare('SELECT * FROM polls WHERE id = ?').bind(id).first<Poll>();
	return result;
}

export async function getPollsForQuestion(db: D1Database, questionId: string): Promise<Poll[]> {
	const result = await db
		.prepare('SELECT * FROM polls WHERE question_id = ? ORDER BY created_at DESC')
		.bind(questionId)
		.all<Poll>();
	return result.results;
}

export async function createPoll(
	db: D1Database,
	data: { question_id: string; model_id: string; batch_id?: string }
): Promise<Poll> {
	const id = nanoid(12);
	await db
		.prepare('INSERT INTO polls (id, question_id, model_id, batch_id) VALUES (?, ?, ?, ?)')
		.bind(id, data.question_id, data.model_id, data.batch_id ?? null)
		.run();
	return (await getPoll(db, id))!;
}

// Create a batch of N polls for multi-sample polling
export async function createPollBatch(
	db: D1Database,
	data: { question_id: string; model_id: string; sample_count: number }
): Promise<Poll[]> {
	const batch_id = nanoid(12);
	const polls: Poll[] = [];

	for (let i = 0; i < data.sample_count; i++) {
		const poll = await createPoll(db, {
			question_id: data.question_id,
			model_id: data.model_id,
			batch_id
		});
		polls.push(poll);
	}

	return polls;
}

export async function updatePollStatus(db: D1Database, id: string, status: PollStatus): Promise<Poll | null> {
	const completedAt = status === 'complete' || status === 'failed' ? "datetime('now')" : 'NULL';
	await db.prepare(`UPDATE polls SET status = ?, completed_at = ${completedAt} WHERE id = ?`).bind(status, id).run();
	return getPoll(db, id);
}

// Responses
export async function getResponse(db: D1Database, id: string): Promise<Response | null> {
	const result = await db.prepare('SELECT * FROM responses WHERE id = ?').bind(id).first<Response>();
	return result;
}

export async function getResponseForPoll(db: D1Database, pollId: string): Promise<Response | null> {
	const result = await db.prepare('SELECT * FROM responses WHERE poll_id = ?').bind(pollId).first<Response>();
	return result;
}

export async function createResponse(db: D1Database, data: Omit<Response, 'id' | 'created_at'>): Promise<Response> {
	const id = nanoid(12);
	await db
		.prepare(
			'INSERT INTO responses (id, poll_id, raw_response, parsed_answer, justification, reasoning, response_time_ms, error) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
		)
		.bind(
			id,
			data.poll_id,
			data.raw_response,
			data.parsed_answer,
			data.justification,
			data.reasoning,
			data.response_time_ms,
			data.error
		)
		.run();
	return (await getResponse(db, id))!;
}

// Aggregation queries
export interface QuestionResults {
	question: Question;
	responses: Array<{
		model: Model;
		poll: Poll;
		response: Response | null;
	}>;
}

export async function getQuestionResults(db: D1Database, questionId: string): Promise<QuestionResults | null> {
	const question = await getQuestion(db, questionId);
	if (!question) return null;

	const polls = await getPollsForQuestion(db, questionId);
	const responses: QuestionResults['responses'] = [];

	for (const poll of polls) {
		const model = await getModel(db, poll.model_id);
		const response = await getResponseForPoll(db, poll.id);
		if (model) {
			responses.push({ model, poll, response });
		}
	}

	return { question, responses };
}

export async function getCategories(db: D1Database): Promise<string[]> {
	const result = await db
		.prepare('SELECT DISTINCT category FROM questions WHERE category IS NOT NULL ORDER BY category')
		.all<{ category: string }>();
	return result.results.map((r) => r.category);
}

export async function getCategoriesWithDescriptions(db: D1Database): Promise<Category[]> {
	const result = await db
		.prepare('SELECT name, description, display_order FROM categories ORDER BY display_order')
		.all<Category>();
	return result.results;
}

export async function getCategoryDescription(db: D1Database, name: string): Promise<string | null> {
	const result = await db
		.prepare('SELECT description FROM categories WHERE name = ?')
		.bind(name)
		.first<{ description: string }>();
	return result?.description ?? null;
}

// Users
export async function getUserCount(db: D1Database): Promise<number> {
	const result = await db.prepare('SELECT COUNT(*) as count FROM user').first<{ count: number }>();
	return result?.count ?? 0;
}

export async function isFirstUser(db: D1Database): Promise<boolean> {
	const count = await getUserCount(db);
	return count === 0;
}

export async function setUserAdmin(db: D1Database, userId: string, isAdmin: boolean): Promise<void> {
	await db
		.prepare('UPDATE user SET isAdmin = ? WHERE id = ?')
		.bind(isAdmin ? 1 : 0, userId)
		.run();
}

export async function getAdminUsers(db: D1Database): Promise<Array<{ id: string; email: string; name: string }>> {
	const result = await db
		.prepare('SELECT id, email, name FROM user WHERE isAdmin = 1')
		.all<{ id: string; email: string; name: string }>();
	return result.results;
}
