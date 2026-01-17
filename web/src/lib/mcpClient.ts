import { z } from "zod";

const QuoteSchema = z.object({
  quote: z.string(),
  guest: z.string(),
  episode_title: z.string(),
  episode_url: z.string().optional(),
  episode_id: z.string().optional(),
});

export type QuoteResult = z.infer<typeof QuoteSchema>;

const TOOL_NAME = "lennys_quotes.search";

const MCPResponseSchema = z.object({
  results: z.array(QuoteSchema),
});

export async function searchQuotes(query: string): Promise<QuoteResult[]> {
  const url = process.env.MCP_SERVER_URL;
  const token = process.env.MCP_SERVER_AUTH_TOKEN;

  if (!url) {
    throw new Error("MCP_SERVER_URL is required.");
  }

  const response = await fetch(`${url}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MCP request failed (${response.status}): ${text}`);
  }

  const data = MCPResponseSchema.parse(await response.json());
  const results = data.results;
  return z.array(QuoteSchema).parse(results);
}
