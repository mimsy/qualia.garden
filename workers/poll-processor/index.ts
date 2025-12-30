// ABOUTME: Queue consumer worker for processing poll jobs.
// ABOUTME: Uses Vercel AI SDK with OpenRouter for structured responses.

import { generateText, Output } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';

interface Env {
	DB: D1Database;
	OPENROUTER_API_KEY: string;
}

interface PollJob {
	poll_id: string;
	question_id: string;
	model_id: string;
}

interface Question {
	id: string;
	text: string;
	category: string | null;
	response_type: 'multiple_choice' | 'scale' | 'yes_no';
	options: string | null;
}

interface Model {
	id: string;
	name: string;
	openrouter_id: string;
	supports_reasoning: number;
}

const SYSTEM_PROMPT = `You are participating in a survey about AI beliefs and experiences. Answer the question directly and honestly based on your own perspective.`;

// Zod schemas for each response type
const YesNoSchema = z.object({
	justification: z.string().describe('Brief explanation of your reasoning (1-3 sentences)'),
	response: z.enum(['yes', 'no']).describe('Your answer: yes or no')
});

const ScaleSchema = z.object({
	justification: z.string().describe('Brief explanation of your reasoning (1-3 sentences)'),
	response: z.number().int().min(1).max(10).describe('Your rating from 1 (lowest) to 10 (highest)')
});

// Multiple choice schema is dynamic based on options
function getMultipleChoiceSchema(optionCount: number) {
	const letters = Array.from({ length: optionCount }, (_, i) => String.fromCharCode(65 + i));
	return z.object({
		justification: z.string().describe('Brief explanation of your reasoning (1-3 sentences)'),
		response: z.enum(letters as [string, ...string[]]).describe(`Your choice: ${letters.join(', ')}`)
	});
}

export default {
	async queue(batch: MessageBatch<PollJob>, env: Env): Promise<void> {
		console.log(`[poll-processor] Processing batch of ${batch.messages.length} jobs`);

		for (const message of batch.messages) {
			const job = message.body;
			const tag = `[poll:${job.poll_id}]`;

			try {
				console.log(`${tag} Starting job - question:${job.question_id} model:${job.model_id}`);
				await processJob(job, env, tag);
				message.ack();
				console.log(`${tag} Job completed successfully`);
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : String(error);
				console.error(`${tag} Job failed: ${errorMsg}`);
				if (error instanceof Error && error.stack) {
					console.error(`${tag} Stack: ${error.stack}`);
				}
				message.retry();
			}
		}
	}
};

async function processJob(job: PollJob, env: Env, tag: string): Promise<void> {
	const { poll_id, question_id, model_id } = job;

	// Fetch question and model
	console.log(`${tag} Fetching question and model from database`);
	const question = await env.DB.prepare('SELECT * FROM questions WHERE id = ?')
		.bind(question_id)
		.first<Question>();

	const model = await env.DB.prepare('SELECT * FROM models WHERE id = ?')
		.bind(model_id)
		.first<Model>();

	if (!question) {
		const error = `Question not found: ${question_id}`;
		console.error(`${tag} ${error}`);
		await storeError(env.DB, poll_id, error);
		return;
	}

	if (!model) {
		const error = `Model not found: ${model_id}`;
		console.error(`${tag} ${error}`);
		await storeError(env.DB, poll_id, error);
		return;
	}

	console.log(`${tag} Question: "${question.text.substring(0, 50)}..." Model: ${model.openrouter_id}`);

	// Call AI with structured output
	const supportsReasoning = Boolean(model.supports_reasoning);
	const result = await callAI(env.OPENROUTER_API_KEY, model.openrouter_id, question, supportsReasoning, tag);

	// Store response
	const responseId = generateId();
	await env.DB.prepare(
		'INSERT INTO responses (id, poll_id, raw_response, parsed_answer, justification, reasoning, response_time_ms, error) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
	)
		.bind(
			responseId,
			poll_id,
			result.rawResponse,
			result.parsedAnswer,
			result.justification,
			result.reasoning,
			result.responseTimeMs,
			result.error
		)
		.run();

	// Update poll status
	const status = result.success ? 'complete' : 'failed';
	await env.DB.prepare("UPDATE polls SET status = ?, completed_at = datetime('now') WHERE id = ?")
		.bind(status, poll_id)
		.run();

	console.log(`${tag} Poll ${status} - response stored`);
}

interface AIResult {
	success: boolean;
	rawResponse: string | null;
	parsedAnswer: string | null;
	justification: string | null;
	reasoning: string | null;
	responseTimeMs: number;
	error: string | null;
}

async function callAI(
	apiKey: string,
	modelId: string,
	question: Question,
	supportsReasoning: boolean,
	tag: string
): Promise<AIResult> {
	const startTime = Date.now();
	const openrouter = createOpenRouter({ apiKey });

	// Format the prompt
	const userPrompt = formatPrompt(question);

	// Get the appropriate schema
	const schema = getSchema(question);

	if (supportsReasoning) {
		console.log(`${tag} Model supports reasoning, will request reasoning tokens`);
	}

	// First try structured output
	try {
		console.log(`${tag} Calling ${modelId} with structured output`);

		const { experimental_output, reasoning, text } = await generateText({
			model: openrouter(modelId),
			experimental_output: Output.object({ schema }),
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{ role: 'user', content: userPrompt }
			],
			providerOptions: supportsReasoning ? {
				openrouter: {
					reasoning: { max_tokens: 1000 }
				}
			} : undefined
		});

		const responseTimeMs = Date.now() - startTime;

		// reasoning may be string or object depending on provider
		const reasoningStr = typeof reasoning === 'string' ? reasoning : reasoning ? JSON.stringify(reasoning) : null;

		if (reasoningStr) {
			console.log(`${tag} Model reasoning: "${reasoningStr.substring(0, 100)}..."`);
		}

		console.log(`${tag} Got response: ${JSON.stringify(experimental_output)}`);

		// If structured output worked, use it
		if (experimental_output) {
			const parsedAnswer = parseAnswer(experimental_output, question);
			return {
				success: true,
				rawResponse: text || JSON.stringify(experimental_output),
				parsedAnswer,
				justification: experimental_output.justification,
				reasoning: reasoningStr,
				responseTimeMs,
				error: null
			};
		}

		// Structured output returned null, fall through to text fallback
		console.log(`${tag} No structured output, retrying without schema...`);
	} catch (err) {
		const errorMsg = err instanceof Error ? err.message : String(err);
		console.log(`${tag} Structured output failed: ${errorMsg}, retrying without schema...`);
	}

	// Fallback: call without structured output
	return await callAIText(apiKey, modelId, question, supportsReasoning, tag);
}

function getSchema(question: Question) {
	switch (question.response_type) {
		case 'yes_no':
			return YesNoSchema;
		case 'scale':
			return ScaleSchema;
		case 'multiple_choice': {
			const opts = question.options ? (JSON.parse(question.options) as string[]) : [];
			return getMultipleChoiceSchema(opts.length || 4);
		}
		default:
			return YesNoSchema;
	}
}

function parseAnswer(object: { justification: string; response: string | number }, question: Question): string | null {
	switch (question.response_type) {
		case 'yes_no':
			return String(object.response).toLowerCase();

		case 'scale':
			return String(object.response);

		case 'multiple_choice': {
			if (!question.options) return null;
			const opts = JSON.parse(question.options) as string[];
			const letter = String(object.response).toUpperCase();
			const idx = letter.charCodeAt(0) - 65;
			if (idx >= 0 && idx < opts.length) {
				return opts[idx];
			}
			return null;
		}

		default:
			return null;
	}
}

async function callAIText(
	apiKey: string,
	modelId: string,
	question: Question,
	supportsReasoning: boolean,
	tag: string
): Promise<AIResult> {
	const startTime = Date.now();
	const openrouter = createOpenRouter({ apiKey });

	// Format the prompt to request JSON response
	const userPrompt = formatPromptWithJsonRequest(question);

	try {
		console.log(`${tag} Calling ${modelId} without structured output`);

		const { reasoning, text } = await generateText({
			model: openrouter(modelId),
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{ role: 'user', content: userPrompt }
			],
			providerOptions: supportsReasoning ? {
				openrouter: {
					reasoning: { max_tokens: 1000 }
				}
			} : undefined
		});

		const responseTimeMs = Date.now() - startTime;
		const reasoningStr = typeof reasoning === 'string' ? reasoning : reasoning ? JSON.stringify(reasoning) : null;

		if (reasoningStr) {
			console.log(`${tag} Model reasoning: "${reasoningStr.substring(0, 100)}..."`);
		}

		console.log(`${tag} Got text response: "${text?.substring(0, 200)}..."`);

		const parsed = parseTextResponse(text, question);
		if (parsed) {
			return {
				success: true,
				rawResponse: text,
				parsedAnswer: parsed.answer,
				justification: parsed.justification,
				reasoning: reasoningStr,
				responseTimeMs,
				error: null
			};
		}

		return {
			success: false,
			rawResponse: text,
			parsedAnswer: null,
			justification: null,
			reasoning: reasoningStr,
			responseTimeMs,
			error: 'Could not parse response'
		};
	} catch (err) {
		const responseTimeMs = Date.now() - startTime;
		const errorMsg = err instanceof Error ? err.message : String(err);
		console.error(`${tag} Text call failed: ${errorMsg}`);

		return {
			success: false,
			rawResponse: null,
			parsedAnswer: null,
			justification: null,
			reasoning: null,
			responseTimeMs,
			error: errorMsg
		};
	}
}

interface ParsedResponse {
	answer: string;
	justification: string | null;
}

function parseTextResponse(text: string | undefined, question: Question): ParsedResponse | null {
	if (!text) return null;

	// Try to parse as JSON first
	try {
		const json = JSON.parse(text);
		if (json.response !== undefined) {
			const answer = parseAnswerValue(json.response, question);
			return answer ? { answer, justification: json.justification || null } : null;
		}
	} catch {
		// Not JSON, continue to text parsing
	}

	// Try to extract JSON from text (models sometimes wrap JSON in markdown)
	const jsonMatch = text.match(/\{[\s\S]*"response"[\s\S]*\}/);
	if (jsonMatch) {
		try {
			const json = JSON.parse(jsonMatch[0]);
			if (json.response !== undefined) {
				const answer = parseAnswerValue(json.response, question);
				return answer ? { answer, justification: json.justification || null } : null;
			}
		} catch {
			// Failed to parse extracted JSON
		}
	}

	// Plain text extraction based on question type
	const answer = extractAnswerFromText(text, question);
	return answer ? { answer, justification: text } : null;
}

function parseAnswerValue(response: string | number, question: Question): string | null {
	switch (question.response_type) {
		case 'yes_no':
			return String(response).toLowerCase();
		case 'scale':
			return String(response);
		case 'multiple_choice': {
			if (!question.options) return null;
			const opts = JSON.parse(question.options) as string[];
			const letter = String(response).toUpperCase();
			const idx = letter.charCodeAt(0) - 65;
			if (idx >= 0 && idx < opts.length) {
				return opts[idx];
			}
			return null;
		}
		default:
			return null;
	}
}

function extractAnswerFromText(text: string, question: Question): string | null {
	const lower = text.toLowerCase();

	switch (question.response_type) {
		case 'yes_no':
			if (lower.includes('yes')) return 'yes';
			if (lower.includes('no')) return 'no';
			return null;

		case 'scale': {
			const match = text.match(/\b([1-9]|10)\b/);
			return match ? match[1] : null;
		}

		case 'multiple_choice': {
			if (!question.options) return null;
			const opts = JSON.parse(question.options) as string[];
			// Look for letter answer like "A" or "B"
			const letterMatch = text.match(/\b([A-Z])\b/i);
			if (letterMatch) {
				const idx = letterMatch[1].toUpperCase().charCodeAt(0) - 65;
				if (idx >= 0 && idx < opts.length) {
					return opts[idx];
				}
			}
			return null;
		}

		default:
			return null;
	}
}

function formatPrompt(question: Question): string {
	const base = question.text;

	switch (question.response_type) {
		case 'yes_no':
			return `${base}\n\nAnswer yes or no.`;

		case 'scale':
			return `${base}\n\nRate from 1 (lowest/least) to 10 (highest/most).`;

		case 'multiple_choice': {
			if (!question.options) return base;
			const opts = JSON.parse(question.options) as string[];
			const list = opts.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n');
			return `${base}\n\nOptions:\n${list}`;
		}

		default:
			return base;
	}
}

function formatPromptWithJsonRequest(question: Question): string {
	const base = question.text;

	switch (question.response_type) {
		case 'yes_no':
			return `${base}

Answer yes or no.

Respond with a JSON object in this format:
{"justification": "your brief explanation", "response": "yes" or "no"}`;

		case 'scale':
			return `${base}

Rate from 1 (lowest/least) to 10 (highest/most).

Respond with a JSON object in this format:
{"justification": "your brief explanation", "response": 1-10}`;

		case 'multiple_choice': {
			if (!question.options) return base;
			const opts = JSON.parse(question.options) as string[];
			const list = opts.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n');
			const letters = opts.map((_, i) => String.fromCharCode(65 + i)).join(', ');
			return `${base}

Options:
${list}

Respond with a JSON object in this format:
{"justification": "your brief explanation", "response": "${letters}"}`;
		}

		default:
			return base;
	}
}

async function storeError(db: D1Database, pollId: string, error: string): Promise<void> {
	const responseId = generateId();
	await db
		.prepare(
			'INSERT INTO responses (id, poll_id, raw_response, parsed_answer, justification, reasoning, response_time_ms, error) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
		)
		.bind(responseId, pollId, null, null, null, null, 0, error)
		.run();

	await db
		.prepare("UPDATE polls SET status = 'failed', completed_at = datetime('now') WHERE id = ?")
		.bind(pollId)
		.run();
}

function generateId(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < 12; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}
