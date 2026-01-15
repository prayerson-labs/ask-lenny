# Ask Lenny

Minimal chat app that answers questions using only Lenny's Podcast quotes via the `lennys_quotes.search` MCP tool.

## Requirements
- Node.js 18+
- MCP server running at `MCP_SERVER_URL`
- OpenAI API key for `gpt-4.1`

## Backend setup (Node/Express)
```bash
cd server
```

Create a `.env` file in `server/`:
```
MCP_SERVER_URL=http://localhost:8989
MCP_SERVER_AUTH_TOKEN=dev123
OPENAI_API_KEY=your_openai_key_here
PORT=4000
```

Run the server:
```bash
npm run dev
```

## Frontend setup (Next.js)
```bash
cd web
```

Create a `.env.local` file in `web/` (optional):
```
NEXT_PUBLIC_API_BASE=http://localhost:4000
NEXT_PUBLIC_EPISODE_BASE_URL=https://www.lennyspodcast.com/episodes/
```

Run the app:
```bash
npm run dev
```

Open http://localhost:3000 and ask a question.
