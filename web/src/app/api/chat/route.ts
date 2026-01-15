import { z } from "zod";
import { answerQuestion } from "@/lib/llm";

export const runtime = "nodejs";

const ChatRequestSchema = z.object({
  question: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ChatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Invalid request payload." }, { status: 400 });
  }

  try {
    const result = await answerQuestion(parsed.data.question);

    if (result.kind === "no_results") {
      return Response.json({
        kind: "no_results",
        message: "no relevant lenny’s podcast quotes found for this topic.",
      });
    }

    return Response.json({
      kind: "answer",
      paragraphs: result.payload.paragraphs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return Response.json({ error: message }, { status: 500 });
  }
}
