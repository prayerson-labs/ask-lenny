import { Router } from "express";
import { z } from "zod";
import { answerQuestion } from "../llm.js";

const router = Router();

const ChatRequestSchema = z.object({
  question: z.string().min(1),
});

router.post("/chat", async (req, res) => {
  const parsed = ChatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request payload." });
  }

  try {
    const result = await answerQuestion(parsed.data.question);

    if (result.kind === "no_results") {
      return res.json({
        kind: "no_results",
        message: "no relevant lenny’s podcast quotes found for this topic.",
      });
    }

    return res.json({
      kind: "answer",
      paragraphs: result.payload.paragraphs,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error.";
    return res.status(500).json({ error: message });
  }
});

export default router;
