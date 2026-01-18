# Ask Lenny

Minimal chat app that answers questions using only Lenny's Podcast quotes via the `lennys_quotes.search` MCP tool.

## Requirements
- Node.js 18+
- MCP server running at `MCP_SERVER_URL`
- OpenAI API key for `gpt-4.1`

## App setup (Next.js with API routes)
```bash
cd web
```

Create a `.env.local` file in `web/`:
```
OPENAI_API_KEY=your_openai_key_here
MCP_SERVER_URL=http://localhost:8989
MCP_SERVER_AUTH_TOKEN=dev123
NEXT_PUBLIC_EPISODE_BASE_URL=https://www.lennyspodcast.com/episodes/
```

Run the app:
```bash
npm run dev
```

Open http://localhost:3000 and ask a question.

## Server keep-alive
Server keep-alive: handled via Vercel cron job pinging the Railway /health endpoint every 5 minutes to prevent cold starts.

## Railway start command
- **Builder:** nixpacks
- **Start Command:** `cd mcp-lennys-quotes && npm ci && npm run build && npm start`
