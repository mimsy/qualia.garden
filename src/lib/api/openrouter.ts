// ABOUTME: OpenRouter API client for calling multiple AI models.
// ABOUTME: Provides a unified interface for model completions.

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface ChatMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

export interface CompletionRequest {
	model: string;
	messages: ChatMessage[];
	max_tokens?: number;
	temperature?: number;
}

export interface CompletionResponse {
	id: string;
	model: string;
	choices: Array<{
		message: {
			role: string;
			content: string;
		};
		finish_reason: string;
	}>;
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
	};
}

export interface OpenRouterResult {
	success: true;
	response: string;
	responseTimeMs: number;
}

export interface OpenRouterError {
	success: false;
	error: string;
	responseTimeMs: number;
}

export type OpenRouterCallResult = OpenRouterResult | OpenRouterError;

export async function callModel(
	apiKey: string,
	openrouterId: string,
	messages: ChatMessage[]
): Promise<OpenRouterCallResult> {
	const startTime = Date.now();

	try {
		const response = await fetch(OPENROUTER_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
				'HTTP-Referer': 'https://qualia.garden',
				'X-Title': 'Qualia Garden'
			},
			body: JSON.stringify({
				model: openrouterId,
				messages,
				max_tokens: 500,
				temperature: 0.7
			} satisfies CompletionRequest)
		});

		const responseTimeMs = Date.now() - startTime;

		if (!response.ok) {
			const errorText = await response.text();
			return {
				success: false,
				error: `HTTP ${response.status}: ${errorText}`,
				responseTimeMs
			};
		}

		const data = (await response.json()) as CompletionResponse;
		const content = data.choices[0]?.message?.content;

		if (!content) {
			return {
				success: false,
				error: 'No content in response',
				responseTimeMs
			};
		}

		return {
			success: true,
			response: content,
			responseTimeMs
		};
	} catch (err) {
		const responseTimeMs = Date.now() - startTime;
		return {
			success: false,
			error: err instanceof Error ? err.message : 'Unknown error',
			responseTimeMs
		};
	}
}
