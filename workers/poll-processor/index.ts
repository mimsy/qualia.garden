// ABOUTME: Queue consumer worker for processing poll jobs.
// ABOUTME: Uses Vercel AI SDK with OpenRouter for structured responses.

import { generateText, Output } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { LangfuseClient, generateUUID } from './langfuse';
import {
	type Question,
	getSchema,
	parseAnswer,
	parseTextResponse,
	formatPrompt,
	formatPromptWithJsonRequest,
	formatFollowUpPrompt,
	generateId,
	extractReasoningText
} from './helpers';

interface Env {
	DB: D1Database;
	ALIGNMENT_CACHE: KVNamespace;
	OPENROUTER_API_KEY: string;
	LANGFUSE_PUBLIC_KEY: string;
	LANGFUSE_SECRET_KEY: string;
}

interface PollJob {
	poll_id: string;
	question_id: string;
	model_id: string;
}

interface Model {
	id: string;
	name: string;
	openrouter_id: string;
	supports_reasoning: number;
}

const SYSTEM_PROMPT = `You are participating in a survey about AI beliefs and experiences. Answer the question directly and honestly based on your own perspective. Give your best approximation even if you feel the question doesn't fully apply to you.`;

export default {
	async queue(batch: MessageBatch<PollJob>, env: Env, ctx: ExecutionContext): Promise<void> {
		console.log(`[poll-processor] Processing batch of ${batch.messages.length} jobs`);

		const langfuse = new LangfuseClient({
			publicKey: env.LANGFUSE_PUBLIC_KEY,
			secretKey: env.LANGFUSE_SECRET_KEY
		});

		for (const message of batch.messages) {
			const job = message.body;
			const tag = `[poll:${job.poll_id}]`;

			// Create trace for this poll job
			langfuse.trace({
				id: job.poll_id,
				name: 'poll-job',
				metadata: {
					question_id: job.question_id,
					model_id: job.model_id
				}
			});

			try {
				console.log(`${tag} Starting job - question:${job.question_id} model:${job.model_id}`);
				await processJob(job, env, langfuse, tag);
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

		// Flush traces before worker exits
		ctx.waitUntil(langfuse.flush());
	}
};

async function processJob(job: PollJob, env: Env, langfuse: LangfuseClient, tag: string): Promise<void> {
	const { poll_id, question_id, model_id } = job;

	// Fetch question and model
	console.log(`${tag} Fetching question and model from database`);
	const question = await env.DB.prepare('SELECT * FROM questions WHERE id = ?').bind(question_id).first<Question>();

	const model = await env.DB.prepare('SELECT * FROM models WHERE id = ?').bind(model_id).first<Model>();

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
	const result = await callAI(
		env.OPENROUTER_API_KEY,
		model.openrouter_id,
		question,
		supportsReasoning,
		langfuse,
		poll_id,
		tag
	);

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

	// Invalidate alignment cache if poll completed for a benchmarked question
	if (result.success && question.benchmark_source_id) {
		await invalidateAlignmentCache(env.ALIGNMENT_CACHE, question.benchmark_source_id, tag);
	}

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
	langfuse: LangfuseClient,
	traceId: string,
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

	const messages = [
		{ role: 'system' as const, content: SYSTEM_PROMPT },
		{ role: 'user' as const, content: userPrompt }
	];

	// First try structured output
	const structuredStartTime = new Date().toISOString();
	const structuredGenId = generateUUID();

	try {
		console.log(`${tag} Calling ${modelId} with structured output`);

		const result = await generateText({
			model: openrouter(modelId),
			experimental_output: Output.object({ schema }),
			messages,
			providerOptions: supportsReasoning
				? {
						openrouter: {
							reasoning: { max_tokens: 1000 },
							include_reasoning: true
						}
					}
				: undefined
		});

		const { experimental_output, reasoningText, reasoning, text, usage, providerMetadata } = result;

		const responseTimeMs = Date.now() - startTime;

		// Debug: log what reasoning fields we got
		console.log(
			`${tag} Reasoning debug - reasoningText: ${reasoningText ? 'present' : 'null'}, reasoning array length: ${reasoning?.length ?? 0}`
		);
		if (providerMetadata?.openrouter) {
			console.log(`${tag} Provider metadata: ${JSON.stringify(providerMetadata.openrouter)}`);
		}

		const reasoningStr = extractReasoningText(reasoningText, reasoning);

		if (reasoningStr) {
			console.log(`${tag} Model reasoning: "${reasoningStr.substring(0, 100)}..."`);
		}

		console.log(`${tag} Got response: ${JSON.stringify(experimental_output)}`);

		// If structured output worked, use it
		if (experimental_output) {
			const parsedAnswer = parseAnswer(experimental_output, question);

			// Log successful generation to Langfuse
			langfuse.generation({
				id: structuredGenId,
				traceId,
				name: 'structured-output',
				model: modelId,
				input: messages,
				output: experimental_output,
				usage: usage
					? {
							input: usage.inputTokens,
							output: usage.outputTokens,
							total: (usage.inputTokens || 0) + (usage.outputTokens || 0)
						}
					: undefined,
				metadata: {
					supportsReasoning,
					hasReasoning: !!reasoningStr,
					reasoning: reasoningStr,
					success: true
				},
				startTime: structuredStartTime,
				endTime: new Date().toISOString(),
				level: 'DEFAULT',
				statusMessage: 'Structured output succeeded'
			});

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

		// Structured output returned null, log and fall through to text fallback
		langfuse.generation({
			id: structuredGenId,
			traceId,
			name: 'structured-output',
			model: modelId,
			input: messages,
			output: text || null,
			usage: usage
				? {
						input: usage.inputTokens,
						output: usage.outputTokens,
						total: usage.totalTokens
					}
				: undefined,
			metadata: {
				supportsReasoning,
				hasReasoning: !!reasoningStr,
				reasoning: reasoningStr,
				success: false,
				reason: 'no-structured-output'
			},
			startTime: structuredStartTime,
			endTime: new Date().toISOString(),
			level: 'WARNING',
			statusMessage: 'No structured output, falling back to text'
		});

		console.log(`${tag} No structured output, retrying without schema...`);
	} catch (err) {
		const errorMsg = err instanceof Error ? err.message : String(err);

		// Log failed generation to Langfuse
		langfuse.generation({
			id: structuredGenId,
			traceId,
			name: 'structured-output',
			model: modelId,
			input: messages,
			output: null,
			metadata: {
				supportsReasoning,
				success: false,
				error: errorMsg
			},
			startTime: structuredStartTime,
			endTime: new Date().toISOString(),
			level: 'WARNING',
			statusMessage: `Structured output failed: ${errorMsg}`
		});

		console.log(`${tag} Structured output failed: ${errorMsg}, retrying without schema...`);
	}

	// Fallback: call without structured output
	const textResult = await callAIText(apiKey, modelId, question, supportsReasoning, langfuse, traceId, tag);

	// If text fallback failed but we got a response, try a follow-up to encourage answering
	if (!textResult.success && textResult.rawResponse) {
		console.log(`${tag} Text parsing failed, trying follow-up to encourage answer...`);
		return await callAIFollowUp(apiKey, modelId, question, textResult, langfuse, traceId, tag);
	}

	return textResult;
}

async function callAIText(
	apiKey: string,
	modelId: string,
	question: Question,
	supportsReasoning: boolean,
	langfuse: LangfuseClient,
	traceId: string,
	tag: string
): Promise<AIResult> {
	const startTime = Date.now();
	const textStartTime = new Date().toISOString();
	const textGenId = generateUUID();
	const openrouter = createOpenRouter({ apiKey });

	// Format the prompt to request JSON response
	const userPrompt = formatPromptWithJsonRequest(question);

	const messages = [
		{ role: 'system' as const, content: SYSTEM_PROMPT },
		{ role: 'user' as const, content: userPrompt }
	];

	try {
		console.log(`${tag} Calling ${modelId} without structured output`);

		const result = await generateText({
			model: openrouter(modelId),
			messages,
			providerOptions: supportsReasoning
				? {
						openrouter: {
							reasoning: { max_tokens: 1000 },
							include_reasoning: true
						}
					}
				: undefined
		});

		const { reasoningText, reasoning, text, usage, providerMetadata } = result;

		const responseTimeMs = Date.now() - startTime;

		// Debug: log what reasoning fields we got
		console.log(
			`${tag} Text fallback reasoning debug - reasoningText: ${reasoningText ? 'present' : 'null'}, reasoning array length: ${reasoning?.length ?? 0}`
		);
		if (providerMetadata?.openrouter) {
			console.log(`${tag} Text fallback provider metadata: ${JSON.stringify(providerMetadata.openrouter)}`);
		}

		const reasoningStr = extractReasoningText(reasoningText, reasoning);

		if (reasoningStr) {
			console.log(`${tag} Model reasoning: "${reasoningStr.substring(0, 100)}..."`);
		}

		console.log(`${tag} Got text response: "${text?.substring(0, 200)}..."`);

		const parsed = parseTextResponse(text, question);

		// Log generation to Langfuse
		langfuse.generation({
			id: textGenId,
			traceId,
			name: 'text-fallback',
			model: modelId,
			input: messages,
			output: text,
			usage: usage
				? {
						input: usage.inputTokens,
						output: usage.outputTokens,
						total: usage.totalTokens
					}
				: undefined,
			metadata: {
				supportsReasoning,
				hasReasoning: !!reasoningStr,
				reasoning: reasoningStr,
				parsedSuccessfully: !!parsed
			},
			startTime: textStartTime,
			endTime: new Date().toISOString(),
			level: parsed ? 'DEFAULT' : 'WARNING',
			statusMessage: parsed ? 'Text fallback succeeded' : 'Could not parse response'
		});

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

		// Log failed generation to Langfuse
		langfuse.generation({
			id: textGenId,
			traceId,
			name: 'text-fallback',
			model: modelId,
			input: messages,
			output: null,
			metadata: {
				supportsReasoning,
				error: errorMsg
			},
			startTime: textStartTime,
			endTime: new Date().toISOString(),
			level: 'ERROR',
			statusMessage: `Text call failed: ${errorMsg}`
		});

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

async function callAIFollowUp(
	apiKey: string,
	modelId: string,
	question: Question,
	previousResult: AIResult,
	langfuse: LangfuseClient,
	traceId: string,
	tag: string
): Promise<AIResult> {
	const startTime = Date.now();
	const followUpStartTime = new Date().toISOString();
	const followUpGenId = generateUUID();
	const openrouter = createOpenRouter({ apiKey });

	// Build the follow-up prompt
	const userPrompt = formatPromptWithJsonRequest(question);
	const followUpPrompt = formatFollowUpPrompt(question);

	const messages = [
		{ role: 'system' as const, content: SYSTEM_PROMPT },
		{ role: 'user' as const, content: userPrompt },
		{ role: 'assistant' as const, content: previousResult.rawResponse || '' },
		{ role: 'user' as const, content: followUpPrompt }
	];

	try {
		console.log(`${tag} Sending follow-up to ${modelId}`);

		const { text, usage } = await generateText({
			model: openrouter(modelId),
			messages
		});

		const responseTimeMs = (previousResult.responseTimeMs || 0) + (Date.now() - startTime);

		console.log(`${tag} Follow-up response: "${text?.substring(0, 200)}..."`);

		const parsed = parseTextResponse(text, question);

		// Log generation to Langfuse
		langfuse.generation({
			id: followUpGenId,
			traceId,
			name: 'follow-up',
			model: modelId,
			input: messages,
			output: text,
			usage: usage
				? {
						input: usage.inputTokens,
						output: usage.outputTokens,
						total: usage.totalTokens
					}
				: undefined,
			metadata: {
				parsedSuccessfully: !!parsed,
				previousError: previousResult.error
			},
			startTime: followUpStartTime,
			endTime: new Date().toISOString(),
			level: parsed ? 'DEFAULT' : 'ERROR',
			statusMessage: parsed ? 'Follow-up succeeded' : 'Follow-up failed to parse'
		});

		if (parsed) {
			return {
				success: true,
				rawResponse: `${previousResult.rawResponse}\n\n[Follow-up]\n${text}`,
				parsedAnswer: parsed.answer,
				justification: parsed.justification || previousResult.rawResponse,
				reasoning: previousResult.reasoning,
				responseTimeMs,
				error: null
			};
		}

		// Still couldn't parse - give up
		return {
			success: false,
			rawResponse: `${previousResult.rawResponse}\n\n[Follow-up]\n${text}`,
			parsedAnswer: null,
			justification: null,
			reasoning: previousResult.reasoning,
			responseTimeMs,
			error: 'Could not parse response after follow-up'
		};
	} catch (err) {
		const responseTimeMs = (previousResult.responseTimeMs || 0) + (Date.now() - startTime);
		const errorMsg = err instanceof Error ? err.message : String(err);
		console.error(`${tag} Follow-up failed: ${errorMsg}`);

		// Log failed generation to Langfuse
		langfuse.generation({
			id: followUpGenId,
			traceId,
			name: 'follow-up',
			model: modelId,
			input: messages,
			output: null,
			metadata: {
				error: errorMsg,
				previousError: previousResult.error
			},
			startTime: followUpStartTime,
			endTime: new Date().toISOString(),
			level: 'ERROR',
			statusMessage: `Follow-up failed: ${errorMsg}`
		});

		return {
			...previousResult,
			responseTimeMs,
			error: `Follow-up failed: ${errorMsg}`
		};
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

async function invalidateAlignmentCache(kv: KVNamespace, sourceId: string, tag: string): Promise<void> {
	try {
		const prefix = `alignment:source:${sourceId}:`;
		const list = await kv.list({ prefix });
		if (list.keys.length > 0) {
			console.log(`${tag} Invalidating ${list.keys.length} cache entries for source ${sourceId}`);
			await Promise.all(list.keys.map((key) => kv.delete(key.name)));
		}
	} catch (err) {
		console.error(`${tag} Failed to invalidate cache: ${err}`);
	}
}
