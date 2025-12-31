// ABOUTME: Lightweight Langfuse client using direct HTTP API.
// ABOUTME: Compatible with Cloudflare Workers edge runtime.

interface LangfuseConfig {
	publicKey: string;
	secretKey: string;
	baseUrl?: string;
}

interface TraceEvent {
	type: 'trace-create';
	body: {
		id: string;
		name: string;
		metadata?: Record<string, unknown>;
		input?: unknown;
		output?: unknown;
	};
}

interface GenerationEvent {
	type: 'generation-create';
	body: {
		id: string;
		traceId: string;
		name: string;
		model: string;
		input?: unknown;
		output?: unknown;
		usage?: {
			input?: number;
			output?: number;
			total?: number;
		};
		metadata?: Record<string, unknown>;
		startTime: string;
		endTime?: string;
		level?: 'DEBUG' | 'DEFAULT' | 'WARNING' | 'ERROR';
		statusMessage?: string;
	};
}

type IngestionEvent = TraceEvent | GenerationEvent;

export class LangfuseClient {
	private events: IngestionEvent[] = [];
	private config: Required<LangfuseConfig>;

	constructor(config: LangfuseConfig) {
		this.config = {
			...config,
			baseUrl: config.baseUrl || 'https://cloud.langfuse.com'
		};
	}

	trace(data: TraceEvent['body']): void {
		this.events.push({ type: 'trace-create', body: data });
	}

	generation(data: GenerationEvent['body']): void {
		this.events.push({ type: 'generation-create', body: data });
	}

	async flush(): Promise<void> {
		if (this.events.length === 0) return;

		const batch = this.events.map((event) => ({
			...event,
			timestamp: new Date().toISOString()
		}));
		this.events = [];

		const auth = btoa(`${this.config.publicKey}:${this.config.secretKey}`);

		try {
			const response = await fetch(`${this.config.baseUrl}/api/public/ingestion`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Basic ${auth}`
				},
				body: JSON.stringify({ batch })
			});

			if (!response.ok) {
				console.error(`[langfuse] Ingestion failed: ${response.status} ${await response.text()}`);
			}
		} catch (error) {
			console.error(`[langfuse] Ingestion error: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
}

export function generateUUID(): string {
	return crypto.randomUUID();
}
