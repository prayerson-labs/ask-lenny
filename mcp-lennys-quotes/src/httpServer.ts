import http from "http";
import path from "path";
import { loadAllTranscripts } from "./data/loader.js";
import { buildSearchIndex, searchIndex } from "./data/indexer.js";
import { searchResultToQuote } from "./utils/quote-extractor.js";

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: {
    name?: string;
    arguments?: {
      query?: string;
      guest?: string;
      limit?: number;
      min_score?: number;
    };
  };
};

const TOOL_NAME = "lennys_quotes.search";
const port = process.env.PORT || 8989;
const AUTH_TOKEN = process.env.MCP_SERVER_AUTH_TOKEN;

function respond(res: http.ServerResponse, status: number, payload: unknown) {
  const body = JSON.stringify(payload);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(body);
}

function parseBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

async function main() {
  console.error("Starting Lenny's Quotes HTTP MCP server...");
  const dataDir = path.join(process.cwd(), "data", "transcripts");
  const episodes = await loadAllTranscripts(dataDir);
  if (episodes.length === 0) {
    throw new Error("No transcripts found. Ensure data/transcripts exists.");
  }
  const index = buildSearchIndex(episodes);

  const server = http.createServer(async (req, res) => {
    if (req.method !== "POST") {
      return respond(res, 405, { error: "Method Not Allowed" });
    }

    if (AUTH_TOKEN) {
      const auth = req.headers.authorization ?? "";
      if (auth !== `Bearer ${AUTH_TOKEN}`) {
        return respond(res, 401, { error: "Unauthorized" });
      }
    }

    try {
      const rawBody = await parseBody(req);
      const body = JSON.parse(rawBody) as JsonRpcRequest;

      if (body.method !== "tools/call") {
        return respond(res, 400, {
          jsonrpc: "2.0",
          id: body.id ?? null,
          error: { code: -32601, message: "Method not found" },
        });
      }

      if (body.params?.name !== TOOL_NAME) {
        return respond(res, 400, {
          jsonrpc: "2.0",
          id: body.id ?? null,
          error: { code: -32601, message: "Tool not found" },
        });
      }

      const args = body.params?.arguments ?? {};
      const query = args.query?.trim();
      if (!query) {
        return respond(res, 400, {
          jsonrpc: "2.0",
          id: body.id ?? null,
          error: { code: -32602, message: "Missing query" },
        });
      }

      const results = searchIndex(index, query, {
        guest: args.guest,
        limit: args.limit ?? 5,
        minScore: args.min_score ?? 0.1,
      });

      const quotes = results.map((result) => {
        const quote = searchResultToQuote(result);
        return {
          quote: quote.text,
          guest: quote.guest,
          episode_title: quote.episodeTitle,
          episode_url: quote.youtubeUrl,
          episode_id: result.episode.folderName,
        };
      });

      return respond(res, 200, {
        jsonrpc: "2.0",
        id: body.id ?? null,
        result: { results: quotes },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid request";
      return respond(res, 500, {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32603, message },
      });
    }
  });

  server.listen(port, () => {
    console.error(`HTTP MCP server listening on http://localhost:${port}`);
    console.error(`Tool exposed: ${TOOL_NAME}`);
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
