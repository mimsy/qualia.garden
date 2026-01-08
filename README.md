# Qualia Garden

AI opinion polling platform that surveys large language models on value questions and compares their responses with human data from sources like the World Values Survey.

## Tech Stack

- **Frontend**: SvelteKit 5 with Svelte 5 runes, Tailwind CSS 4
- **Backend**: Cloudflare Pages, D1 (SQLite), Queues
- **AI**: OpenRouter API via Vercel AI SDK
- **Language**: TypeScript
- **Package Manager**: Bun

## Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Run tests
bun run test:run

# Type check
bun run check

# Lint and format
bun run lint
bun run format
```

## Database

```bash
# Create the D1 database (first time only)
wrangler d1 create qualia-garden

# Run migrations locally
bun run db:migrate

# Run migrations on production
bun run db:migrate:remote
```

## Poll Processor Worker

The poll processor is a Cloudflare Queue consumer that handles async AI polling:

```bash
# Run worker locally
bun run worker:dev

# Deploy worker
bun run worker:deploy
```

## Deployment

```bash
# Build and deploy to Cloudflare Pages
bun run deploy
```

The site deploys to Cloudflare Pages. The poll processor worker deploys separately.

## Project Structure

```
src/
  routes/           # SvelteKit pages and API endpoints
  lib/
    db/             # Database queries and types
    api/            # OpenRouter client
    components/     # Svelte components
workers/
  poll-processor/   # Queue consumer for AI polling
migrations/         # D1 SQL migrations
scripts/            # Data import scripts
```

## License

MIT
