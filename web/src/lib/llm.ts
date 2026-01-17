import OpenAI from "openai";
import { z } from "zod";
import { searchQuotes, QuoteResult } from "./mcpClient";

const MODEL = "gpt-4.1";

const CitationSchema = z.object({
  guest: z.string(),
  episode_title: z.string(),
  episode_url: z.string().optional(),
  episode_id: z.string().optional(),
});

const ParagraphSchema = z.object({
  text: z.string(),
  citations: z.array(CitationSchema).min(1),
  quotes: z.array(
    z.object({
      quote: z.string(),
      guest: z.string(),
      episode_title: z.string(),
      episode_url: z.string().optional(),
      episode_id: z.string().optional(),
    })
  ),
});

const AnswerSchema = z.object({
  paragraphs: z.array(ParagraphSchema).min(1),
});

export type AnswerPayload = z.infer<typeof AnswerSchema>;

function ensureHasSource(citation: z.infer<typeof CitationSchema>) {
  if (!citation.episode_url && !citation.episode_id) {
    throw new Error("Citation missing episode_url or episode_id.");
  }
}

function ensureHasSourceInQuotes(quote: QuoteResult) {
  if (!quote.episode_url && !quote.episode_id) {
    throw new Error("Quote missing episode_url or episode_id.");
  }
}

function parseToolArguments(raw: string | undefined, fallback: string) {
  if (!raw) {
    return { query: fallback };
  }
  try {
    const parsed = JSON.parse(raw) as { query?: string };
    return { query: parsed.query ?? fallback };
  } catch {
    return { query: fallback };
  }
}

export async function answerQuestion(question: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required.");
  }

  const client = new OpenAI({ apiKey });

  const toolCallResponse = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    tool_choice: "required",
    tools: [
      {
        type: "function",
        function: {
          name: "lennys_quotes_search",
          description:
            "Search Lenny's podcast quotes by query (maps to MCP tool lennys_quotes.search).",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string" },
            },
            required: ["query"],
          },
        },
      },
    ],
    messages: [
      {
        role: "system",
        content:
          "You are a research assistant for Lenny's Podcast. You must call the search tool before answering and only use the tool results. The tool name is lennys_quotes_search and it maps to the MCP tool lennys_quotes.search.",
      },
      { role: "user", content: question },
    ],
  });

  const toolCall = toolCallResponse.choices[0]?.message.tool_calls?.[0];
  if (
    !toolCall ||
    !("function" in toolCall) ||
    toolCall.function?.name !== "lennys_quotes_search"
  ) {
    throw new Error("Model did not call the required tool.");
  }

  const { query } = parseToolArguments(toolCall.function?.arguments, question);
  const quotes = await searchQuotes(query);

  if (quotes.length === 0) {
    return { kind: "no_results" as const };
  }

  const toolResultMessage = {
    role: "tool" as const,
    tool_call_id: toolCall.id,
    content: JSON.stringify({ results: quotes }),
  };

  const answerResponse = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "lenny_answer",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            paragraphs: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  text: { type: "string" },
                  citations: {
                    type: "array",
                    minItems: 1,
                    items: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        guest: { type: "string" },
                        episode_title: { type: "string" },
                        episode_url: { type: "string" },
                        episode_id: { type: "string" },
                      },
                      required: ["guest", "episode_title"],
                    },
                  },
                  quotes: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        quote: { type: "string" },
                        guest: { type: "string" },
                        episode_title: { type: "string" },
                        episode_url: { type: "string" },
                        episode_id: { type: "string" },
                      },
                      required: ["quote", "guest", "episode_title"],
                    },
                  },
                },
                required: ["text", "citations", "quotes"],
              },
            },
          },
          required: ["paragraphs"],
        },
      },
    },
    messages: [
      {
        role: "system",
        content:
          "Write a clear, calm, analytical response. Use only the tool results. Every paragraph must include at least one citation.",
      },
      { role: "user", content: question },
      {
        role: "assistant",
        tool_calls: [toolCall],
      },
      toolResultMessage,
    ],
  });

  const content = answerResponse.choices[0]?.message.content;
  if (!content) {
    throw new Error("Model returned no content.");
  }

  const parsed = AnswerSchema.parse(JSON.parse(content));

  parsed.paragraphs.forEach((paragraph) => {
    paragraph.citations.forEach(ensureHasSource);
    paragraph.quotes.forEach(ensureHasSourceInQuotes);
  });

  return { kind: "answer" as const, payload: parsed };
}
