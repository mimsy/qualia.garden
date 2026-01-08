# Qualia Garden

AI opinion polling platform that surveys LLMs on value questions and compares responses with human data from the World Values Survey.

## Tech Stack

- **Frontend**: SvelteKit 5 with Svelte 5 runes, Tailwind CSS 4
- **Backend**: Cloudflare Pages (hosting), D1 (SQLite database), Queues (async processing)
- **AI**: OpenRouter API via Vercel AI SDK for structured outputs
- **Language**: TypeScript throughout
- **Package Manager**: Bun

## Architecture

```
src/
  routes/           # SvelteKit pages and API endpoints
    admin/          # Admin dashboard (questions, models, polls)
    questions/      # Public question results pages
    api/            # API routes
  lib/
    db/             # Database types and queries
    api/            # OpenRouter client and prompt formatting
workers/
  poll-processor/   # Cloudflare Queue consumer for async polling
migrations/         # D1 SQL migrations
scripts/            # Import scripts (e.g., World Values Survey data)
```

## Development Commands

```bash
bun run dev              # Start dev server (vite)
bun run build            # Build for production
bun run check            # TypeScript/Svelte checking

# Testing
bun run test             # Run tests in watch mode
bun run test:run         # Run tests once
bun run test:coverage    # Run tests with coverage report

# Linting & Formatting
bun run lint             # Run ESLint
bun run lint:fix         # Fix ESLint errors
bun run format           # Format with Prettier
bun run format:check     # Check formatting

# Database
bun run db:migrate       # Apply migrations to local D1
bun run db:migrate:remote # Apply migrations to remote D1

# Poll processor worker
bun run worker:dev       # Run worker locally
bun run worker:deploy    # Deploy worker to Cloudflare
```

## Deployment

```bash
bun run build
wrangler pages deploy .svelte-kit/cloudflare
```

The site deploys to Cloudflare Pages. The poll processor worker deploys separately.

## Testing

Tests use Vitest. Test files are co-located with source files using `.test.ts` suffix.

```bash
bun run test:run         # Run all tests
bun run test:coverage    # Run with coverage report
```

Key test files:

- `src/lib/alignment.test.ts` - Score calculation tests
- `src/lib/db/queries.test.ts` - Database query tests
- `workers/poll-processor/index.test.ts` - Poll processor helper tests

Git hooks (via Husky):

- **pre-commit**: Runs lint-staged (ESLint + Prettier on staged files)
- **pre-push**: Runs full test suite

## Svelte Development

**Important**: When creating or editing `.svelte` files or `.svelte.ts` modules, use the Svelte MCP server tools for documentation lookup and code validation. The `svelte-file-editor` agent and `svelte-code-writer` skill provide access to official Svelte 5 documentation and can validate code against current best practices.

### Svelte 5 Runes

Use Svelte 5 runes syntax:

```svelte
<script lang="ts">
	let { data } = $props<{ data: PageData }>();
	const derived = $derived(data.items.filter((x) => x.active));
</script>
```

## Database Schema

Core tables:

- **models** - AI models available for polling (name, family, openrouter_id, active)
- **questions** - Survey questions (text, category, response_type, options, active)
- **polls** - Individual poll runs (question × model, status)
- **responses** - AI responses (parsed_answer, justification, reasoning, response_time_ms)
- **benchmark_sources** - External datasets (World Values Survey)
- **human_response_distributions** - Aggregated human responses by demographic

Question response types: `multiple_choice`, `scale` (1-10), `yes_no`

## Code Conventions

### ABOUTME Comments

Every file starts with two lines explaining what it does:

```typescript
// ABOUTME: Queue consumer worker for processing poll jobs.
// ABOUTME: Uses Vercel AI SDK with OpenRouter for structured responses.
```

### Platform Bindings

Access Cloudflare bindings via `platform.env`:

```typescript
export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) return { items: [] };
	// Use platform.env.DB, platform.env.POLL_QUEUE, etc.
};
```

## Key Files

- `src/app.d.ts` - Cloudflare platform type definitions
- `src/lib/db/queries.ts` - All database queries
- `src/lib/db/types.ts` - TypeScript interfaces for DB tables
- `workers/poll-processor/index.ts` - Queue consumer for AI polling
- `workers/poll-processor/helpers.ts` - Testable helper functions for poll processing
- `wrangler.toml` - Cloudflare Pages configuration
- `workers/poll-processor/wrangler.toml` - Worker configuration

## Environment Variables

Required in Cloudflare:

- `OPENROUTER_API_KEY` - API key for OpenRouter
- `DB` - D1 database binding (configured in wrangler.toml)
- `POLL_QUEUE` - Queue binding for async polling
