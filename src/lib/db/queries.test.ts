// ABOUTME: Tests for database query functions.
// ABOUTME: Uses mocked D1 database to verify query behavior.

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock nanoid to return predictable IDs
vi.mock('nanoid', () => ({
	nanoid: vi.fn(() => 'test-id-1234')
}));

import {
	getModels,
	getModel,
	createModel,
	updateModel,
	deleteModel,
	getFamilies,
	getQuestions,
	getQuestion,
	createQuestion,
	updateQuestion,
	getPoll,
	createPoll,
	createPollBatch,
	updatePollStatus,
	getResponse,
	createResponse,
	getCategories,
	getUserCount,
	isFirstUser,
	setUserAdmin
} from './queries';
import type { Model, Question, Poll, Response } from './types';

// Helper to create a mock D1 database
function createMockDb() {
	const mockStatement = {
		bind: vi.fn().mockReturnThis(),
		first: vi.fn(),
		all: vi.fn().mockResolvedValue({ results: [] }),
		run: vi.fn().mockResolvedValue({ success: true, meta: { changes: 1 } })
	};

	const db = {
		prepare: vi.fn(() => mockStatement),
		batch: vi.fn(),
		exec: vi.fn()
	} as unknown as D1Database;

	return { db, mockStatement };
}

describe('Model Queries', () => {
	let db: D1Database;
	let mockStatement: ReturnType<typeof createMockDb>['mockStatement'];

	beforeEach(() => {
		vi.clearAllMocks();
		const mock = createMockDb();
		db = mock.db;
		mockStatement = mock.mockStatement;
	});

	describe('getModels', () => {
		it('queries active models by default', async () => {
			await getModels(db);
			expect(db.prepare).toHaveBeenCalledWith(
				'SELECT * FROM models WHERE active = 1 ORDER BY family, name'
			);
		});

		it('queries all models when activeOnly is false', async () => {
			await getModels(db, false);
			expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM models ORDER BY family, name');
		});
	});

	describe('getModel', () => {
		it('queries by ID', async () => {
			await getModel(db, 'test-id');
			expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM models WHERE id = ?');
			expect(mockStatement.bind).toHaveBeenCalledWith('test-id');
		});

		it('returns null when not found', async () => {
			mockStatement.first.mockResolvedValue(null);
			const result = await getModel(db, 'nonexistent');
			expect(result).toBeNull();
		});

		it('returns model when found', async () => {
			const mockModel: Model = {
				id: 'test-id',
				name: 'GPT-4',
				family: 'OpenAI',
				openrouter_id: 'openai/gpt-4',
				active: true,
				supports_reasoning: false,
				created_at: '2024-01-01'
			};
			mockStatement.first.mockResolvedValue(mockModel);
			const result = await getModel(db, 'test-id');
			expect(result).toEqual(mockModel);
		});
	});

	describe('createModel', () => {
		it('inserts model with correct parameters', async () => {
			const mockModel: Model = {
				id: 'test-id-1234',
				name: 'GPT-4',
				family: 'OpenAI',
				openrouter_id: 'openai/gpt-4',
				active: true,
				supports_reasoning: true,
				created_at: '2024-01-01'
			};
			mockStatement.first.mockResolvedValue(mockModel);

			await createModel(db, {
				name: 'GPT-4',
				family: 'OpenAI',
				openrouter_id: 'openai/gpt-4',
				supports_reasoning: true
			});

			expect(db.prepare).toHaveBeenCalledWith(
				'INSERT INTO models (id, name, family, openrouter_id, supports_reasoning) VALUES (?, ?, ?, ?, ?)'
			);
			expect(mockStatement.bind).toHaveBeenCalledWith(
				'test-id-1234',
				'GPT-4',
				'OpenAI',
				'openai/gpt-4',
				1
			);
		});
	});

	describe('updateModel', () => {
		it('updates only provided fields', async () => {
			mockStatement.first.mockResolvedValue({ id: 'test-id' });
			await updateModel(db, 'test-id', { name: 'New Name' });

			expect(db.prepare).toHaveBeenCalledWith('UPDATE models SET name = ? WHERE id = ?');
			expect(mockStatement.bind).toHaveBeenCalledWith('New Name', 'test-id');
		});

		it('returns unchanged model if no fields provided', async () => {
			mockStatement.first.mockResolvedValue({ id: 'test-id', name: 'Old Name' });
			await updateModel(db, 'test-id', {});

			// Should call getModel but not UPDATE
			expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM models WHERE id = ?');
		});
	});

	describe('deleteModel', () => {
		it('returns true when model deleted', async () => {
			mockStatement.run.mockResolvedValue({ meta: { changes: 1 } });
			const result = await deleteModel(db, 'test-id');
			expect(result).toBe(true);
		});

		it('returns false when model not found', async () => {
			mockStatement.run.mockResolvedValue({ meta: { changes: 0 } });
			const result = await deleteModel(db, 'nonexistent');
			expect(result).toBe(false);
		});
	});

	describe('getFamilies', () => {
		it('returns unique family names', async () => {
			mockStatement.all.mockResolvedValue({
				results: [{ family: 'OpenAI' }, { family: 'Anthropic' }, { family: 'Google' }]
			});
			const result = await getFamilies(db);
			expect(result).toEqual(['OpenAI', 'Anthropic', 'Google']);
		});
	});
});

describe('Question Queries', () => {
	let db: D1Database;
	let mockStatement: ReturnType<typeof createMockDb>['mockStatement'];

	beforeEach(() => {
		vi.clearAllMocks();
		const mock = createMockDb();
		db = mock.db;
		mockStatement = mock.mockStatement;
	});

	describe('getQuestions', () => {
		it('queries published questions by default', async () => {
			await getQuestions(db);
			expect(db.prepare).toHaveBeenCalledWith(
				expect.stringContaining("WHERE status = 'published'")
			);
		});

		it('queries all questions when status is all', async () => {
			await getQuestions(db, { status: 'all' });
			expect(db.prepare).toHaveBeenCalledWith(expect.not.stringContaining('WHERE'));
		});

		it('handles legacy boolean parameter', async () => {
			await getQuestions(db, true);
			expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('WHERE active = 1'));
		});
	});

	describe('getQuestion', () => {
		it('queries by ID', async () => {
			await getQuestion(db, 'q-123');
			expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM questions WHERE id = ?');
			expect(mockStatement.bind).toHaveBeenCalledWith('q-123');
		});
	});

	describe('createQuestion', () => {
		it('creates question with required fields', async () => {
			const mockQuestion: Question = {
				id: 'test-id-1234',
				text: 'Test question?',
				category: 'Test',
				response_type: 'ordinal',
				options: '["A", "B"]',
				active: true,
				status: 'draft',
				created_at: '2024-01-01',
				benchmark_source_id: null,
				benchmark_question_id: null
			};
			mockStatement.first.mockResolvedValue(mockQuestion);

			await createQuestion(db, {
				text: 'Test question?',
				category: 'Test',
				response_type: 'ordinal',
				options: '["A", "B"]'
			});

			expect(mockStatement.bind).toHaveBeenCalledWith(
				'test-id-1234',
				'Test question?',
				'Test',
				'ordinal',
				'["A", "B"]',
				'draft',
				null,
				null
			);
		});
	});

	describe('updateQuestion', () => {
		it('updates multiple fields', async () => {
			mockStatement.first.mockResolvedValue({ id: 'q-123' });
			await updateQuestion(db, 'q-123', { text: 'New text', category: 'New category' });

			expect(db.prepare).toHaveBeenCalledWith(
				'UPDATE questions SET text = ?, category = ? WHERE id = ?'
			);
		});
	});
});

describe('Poll Queries', () => {
	let db: D1Database;
	let mockStatement: ReturnType<typeof createMockDb>['mockStatement'];

	beforeEach(() => {
		vi.clearAllMocks();
		const mock = createMockDb();
		db = mock.db;
		mockStatement = mock.mockStatement;
	});

	describe('getPoll', () => {
		it('queries by ID', async () => {
			await getPoll(db, 'p-123');
			expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM polls WHERE id = ?');
		});
	});

	describe('createPoll', () => {
		it('creates poll with batch_id', async () => {
			const mockPoll: Poll = {
				id: 'test-id-1234',
				question_id: 'q-1',
				model_id: 'm-1',
				status: 'pending',
				batch_id: 'batch-1',
				created_at: '2024-01-01',
				completed_at: null
			};
			mockStatement.first.mockResolvedValue(mockPoll);

			await createPoll(db, {
				question_id: 'q-1',
				model_id: 'm-1',
				batch_id: 'batch-1'
			});

			expect(mockStatement.bind).toHaveBeenCalledWith('test-id-1234', 'q-1', 'm-1', 'batch-1');
		});

		it('creates poll without batch_id', async () => {
			const mockPoll: Poll = {
				id: 'test-id-1234',
				question_id: 'q-1',
				model_id: 'm-1',
				status: 'pending',
				batch_id: null,
				created_at: '2024-01-01',
				completed_at: null
			};
			mockStatement.first.mockResolvedValue(mockPoll);

			await createPoll(db, {
				question_id: 'q-1',
				model_id: 'm-1'
			});

			expect(mockStatement.bind).toHaveBeenCalledWith('test-id-1234', 'q-1', 'm-1', null);
		});
	});

	describe('createPollBatch', () => {
		it('creates multiple polls with same batch_id', async () => {
			const mockPoll: Poll = {
				id: 'test-id-1234',
				question_id: 'q-1',
				model_id: 'm-1',
				status: 'pending',
				batch_id: 'test-id-1234',
				created_at: '2024-01-01',
				completed_at: null
			};
			mockStatement.first.mockResolvedValue(mockPoll);

			const result = await createPollBatch(db, {
				question_id: 'q-1',
				model_id: 'm-1',
				sample_count: 3
			});

			expect(result).toHaveLength(3);
			// All should have been called with the same batch_id
			expect(mockStatement.bind).toHaveBeenCalledTimes(6); // 3 polls * 2 calls each (insert + select)
		});
	});

	describe('updatePollStatus', () => {
		it('updates status to complete with timestamp', async () => {
			mockStatement.first.mockResolvedValue({ id: 'p-1', status: 'complete' });
			await updatePollStatus(db, 'p-1', 'complete');

			expect(db.prepare).toHaveBeenCalledWith(
				expect.stringContaining("completed_at = datetime('now')")
			);
		});

		it('updates status to pending without timestamp', async () => {
			mockStatement.first.mockResolvedValue({ id: 'p-1', status: 'pending' });
			await updatePollStatus(db, 'p-1', 'pending');

			expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('completed_at = NULL'));
		});
	});
});

describe('Response Queries', () => {
	let db: D1Database;
	let mockStatement: ReturnType<typeof createMockDb>['mockStatement'];

	beforeEach(() => {
		vi.clearAllMocks();
		const mock = createMockDb();
		db = mock.db;
		mockStatement = mock.mockStatement;
	});

	describe('getResponse', () => {
		it('queries by ID', async () => {
			await getResponse(db, 'r-123');
			expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM responses WHERE id = ?');
		});
	});

	describe('createResponse', () => {
		it('creates response with all fields', async () => {
			const mockResponse: Response = {
				id: 'test-id-1234',
				poll_id: 'p-1',
				raw_response: 'A. Yes',
				parsed_answer: '1',
				justification: 'Because...',
				reasoning: 'Thinking...',
				response_time_ms: 1500,
				error: null,
				created_at: '2024-01-01'
			};
			mockStatement.first.mockResolvedValue(mockResponse);

			await createResponse(db, {
				poll_id: 'p-1',
				raw_response: 'A. Yes',
				parsed_answer: '1',
				justification: 'Because...',
				reasoning: 'Thinking...',
				response_time_ms: 1500,
				error: null
			});

			expect(mockStatement.bind).toHaveBeenCalledWith(
				'test-id-1234',
				'p-1',
				'A. Yes',
				'1',
				'Because...',
				'Thinking...',
				1500,
				null
			);
		});
	});
});

describe('User Queries', () => {
	let db: D1Database;
	let mockStatement: ReturnType<typeof createMockDb>['mockStatement'];

	beforeEach(() => {
		vi.clearAllMocks();
		const mock = createMockDb();
		db = mock.db;
		mockStatement = mock.mockStatement;
	});

	describe('getUserCount', () => {
		it('returns count from database', async () => {
			mockStatement.first.mockResolvedValue({ count: 5 });
			const result = await getUserCount(db);
			expect(result).toBe(5);
		});

		it('returns 0 when no result', async () => {
			mockStatement.first.mockResolvedValue(null);
			const result = await getUserCount(db);
			expect(result).toBe(0);
		});
	});

	describe('isFirstUser', () => {
		it('returns true when no users', async () => {
			mockStatement.first.mockResolvedValue({ count: 0 });
			const result = await isFirstUser(db);
			expect(result).toBe(true);
		});

		it('returns false when users exist', async () => {
			mockStatement.first.mockResolvedValue({ count: 1 });
			const result = await isFirstUser(db);
			expect(result).toBe(false);
		});
	});

	describe('setUserAdmin', () => {
		it('sets user as admin', async () => {
			await setUserAdmin(db, 'user-1', true);
			expect(mockStatement.bind).toHaveBeenCalledWith(1, 'user-1');
		});

		it('removes admin from user', async () => {
			await setUserAdmin(db, 'user-1', false);
			expect(mockStatement.bind).toHaveBeenCalledWith(0, 'user-1');
		});
	});
});

describe('Aggregation Queries', () => {
	let db: D1Database;
	let mockStatement: ReturnType<typeof createMockDb>['mockStatement'];

	beforeEach(() => {
		vi.clearAllMocks();
		const mock = createMockDb();
		db = mock.db;
		mockStatement = mock.mockStatement;
	});

	describe('getCategories', () => {
		it('returns unique categories', async () => {
			mockStatement.all.mockResolvedValue({
				results: [{ category: 'Ethics' }, { category: 'Consciousness' }, { category: 'Values' }]
			});
			const result = await getCategories(db);
			expect(result).toEqual(['Ethics', 'Consciousness', 'Values']);
		});

		it('returns empty array when no categories', async () => {
			mockStatement.all.mockResolvedValue({ results: [] });
			const result = await getCategories(db);
			expect(result).toEqual([]);
		});
	});
});
