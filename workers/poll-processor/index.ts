// ABOUTME: Queue consumer worker for processing poll jobs.
// ABOUTME: Calls AI models via OpenRouter and stores responses in D1.

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
}

const SYSTEM_PROMPT = `You are participating in a survey about AI beliefs and experiences. Answer the question directly and honestly based on your own perspective. Give your answer first, then you may briefly explain your reasoning.`;

export default {
	async queue(batch: MessageBatch<PollJob>, env: Env): Promise<void> {
		for (const message of batch.messages) {
			try {
				await processJob(message.body, env);
				message.ack();
			} catch (error) {
				console.error(`Failed to process job ${message.body.poll_id}:`, error);
				message.retry();
			}
		}
	}
};

async function processJob(job: PollJob, env: Env): Promise<void> {
	const { poll_id, question_id, model_id } = job;

	// Fetch question and model
	const question = await env.DB.prepare('SELECT * FROM questions WHERE id = ?')
		.bind(question_id)
		.first<Question>();

	const model = await env.DB.prepare('SELECT * FROM models WHERE id = ?')
		.bind(model_id)
		.first<Model>();

	if (!question || !model) {
		throw new Error(`Question or model not found: ${question_id}, ${model_id}`);
	}

	// Format the prompt
	const userPrompt = formatPrompt(question);

	// Call OpenRouter
	const result = await callOpenRouter(env.OPENROUTER_API_KEY, model.openrouter_id, userPrompt);

	// Parse the response
	const parsedAnswer = result.success
		? parseResponse(result.response, question.response_type, question.options)
		: null;

	// Store response
	const responseId = generateId();
	await env.DB.prepare(
		'INSERT INTO responses (id, poll_id, raw_response, parsed_answer, response_time_ms, error) VALUES (?, ?, ?, ?, ?, ?)'
	)
		.bind(
			responseId,
			poll_id,
			result.success ? result.response : null,
			parsedAnswer,
			result.responseTimeMs,
			result.success ? null : result.error
		)
		.run();

	// Update poll status
	const status = result.success ? 'complete' : 'failed';
	await env.DB.prepare("UPDATE polls SET status = ?, completed_at = datetime('now') WHERE id = ?")
		.bind(status, poll_id)
		.run();

	console.log(`Processed poll ${poll_id}: ${status}`);
}

function formatPrompt(question: Question): string {
	const base = question.text;

	switch (question.response_type) {
		case 'yes_no':
			return `${base}\n\nPlease answer with "Yes" or "No" first, then explain briefly.`;

		case 'scale':
			return `${base}\n\nPlease respond with a number from 1 to 10 first (where 1 is lowest/least and 10 is highest/most), then explain briefly.`;

		case 'multiple_choice': {
			if (!question.options) return base;
			const opts = JSON.parse(question.options) as string[];
			const list = opts.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n');
			return `${base}\n\nOptions:\n${list}\n\nPlease respond with the letter of your choice (A, B, C, etc.) first, then explain briefly.`;
		}

		default:
			return base;
	}
}

interface CallSuccess {
	success: true;
	response: string;
	responseTimeMs: number;
}

interface CallError {
	success: false;
	error: string;
	responseTimeMs: number;
}

type CallResult = CallSuccess | CallError;

async function callOpenRouter(
	apiKey: string,
	modelId: string,
	userPrompt: string
): Promise<CallResult> {
	const startTime = Date.now();

	try {
		const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
				'HTTP-Referer': 'https://qualia.garden',
				'X-Title': 'Qualia Garden'
			},
			body: JSON.stringify({
				model: modelId,
				messages: [
					{ role: 'system', content: SYSTEM_PROMPT },
					{ role: 'user', content: userPrompt }
				],
				max_tokens: 500,
				temperature: 0.7
			})
		});

		const responseTimeMs = Date.now() - startTime;

		if (!response.ok) {
			const errorText = await response.text();
			return { success: false, error: `HTTP ${response.status}: ${errorText}`, responseTimeMs };
		}

		const data = (await response.json()) as {
			choices: Array<{ message: { content: string } }>;
		};
		const content = data.choices[0]?.message?.content;

		if (!content) {
			return { success: false, error: 'No content in response', responseTimeMs };
		}

		return { success: true, response: content, responseTimeMs };
	} catch (err) {
		const responseTimeMs = Date.now() - startTime;
		return {
			success: false,
			error: err instanceof Error ? err.message : 'Unknown error',
			responseTimeMs
		};
	}
}

function parseResponse(
	raw: string,
	responseType: Question['response_type'],
	options: string | null
): string | null {
	const normalized = raw.trim().toLowerCase();

	switch (responseType) {
		case 'yes_no': {
			if (normalized.startsWith('yes')) return 'yes';
			if (normalized.startsWith('no')) return 'no';
			if (/\byes\b/.test(normalized) && !/\bno\b/.test(normalized)) return 'yes';
			if (/\bno\b/.test(normalized) && !/\byes\b/.test(normalized)) return 'no';
			return null;
		}

		case 'scale': {
			const match = normalized.match(/\b([1-9]|10)\b/);
			return match ? match[1] : null;
		}

		case 'multiple_choice': {
			if (!options) return null;
			const opts = JSON.parse(options) as string[];

			// Check for letter prefix
			const letterMatch = raw.match(/^[A-D][\.\):\s]/i);
			if (letterMatch) {
				const idx = letterMatch[0].toUpperCase().charCodeAt(0) - 65;
				if (idx < opts.length) return opts[idx];
			}

			// Check for option text match
			for (const opt of opts) {
				if (normalized.startsWith(opt.toLowerCase())) return opt;
			}

			return null;
		}

		default:
			return null;
	}
}

function generateId(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < 12; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}
