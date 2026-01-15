import { randomUUID } from "crypto";
import { z } from "zod";

const QuoteSchema = z.object({
  quote: z.string(),
  guest: z.string(),
  episode_title: z.string(),
  episode_url: z.string().optional(),
  episode_id: z.string().optional(),
});

export type QuoteResult = z.infer<typeof QuoteSchema>;

const MCPResponseSchema = z
  .object({
    results: z.array(QuoteSchema),
  })
  .partial()
  .passthrough();

const TOOL_NAME = "lennys_quotes.search";

function extractResults(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.results)) {
      return obj.results;
    }
    if (obj.result && typeof obj.result === "object") {
      const inner = obj.result as Record<string, unknown>;
      if (Array.isArray(inner.results)) {
        return inner.results;
      }
      if (Array.isArray(inner.items)) {
        return inner.items;
      }
    }
    if (Array.isArray(obj.items)) {
      return obj.items;
    }
  }
  return [];
}

export async function searchQuotes(query: string): Promise<QuoteResult[]> {
  const url = process.env.MCP_SERVER_URL;
  const token = process.env.MCP_SERVER_AUTH_TOKEN;

  if (!url) {
    throw new Error("MCP_SERVER_URL is required.");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: randomUUID(),
      method: "tools/call",
      params: {
        name: TOOL_NAME,
        arguments: { query },
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MCP request failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  const parsed = MCPResponseSchema.safeParse(data);
  const results = extractResults(parsed.success ? parsed.data : data);

  return z.array(QuoteSchema).parse(results);
}
