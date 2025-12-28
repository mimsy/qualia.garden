# Qualia Garden

AI opinion polling platform - systematically polls multiple AI models on the same questions and displays aggregated results.

## Tech Stack

- **Frontend:** SvelteKit on Cloudflare Pages
- **Database:** Cloudflare D1 (SQLite)
- **Async Jobs:** Cloudflare Queues
- **AI API:** OpenRouter (unified access to multiple models)

## Development

```bash
npm install
npm run dev
```

## Database

```bash
# Create the D1 database (first time only)
wrangler d1 create qualia-garden

# Run migrations locally
npm run db:migrate

# Run migrations on production
npm run db:migrate:remote
```

## Deployment

Deploys automatically via Cloudflare Pages on push to main.
