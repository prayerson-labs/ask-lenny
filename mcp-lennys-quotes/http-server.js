import express from "express";
import path from "path";
import { loadAllTranscripts } from "./dist/data/loader.js";
import { buildSearchIndex, searchIndex } from "./dist/data/indexer.js";
import { searchResultToQuote } from "./dist/utils/quote-extractor.js";

const PORT = process.env.PORT || 8080;
const app = express();
app.use(express.json({ limit: "1mb" }));

const dataDir = path.join(process.cwd(), "data", "transcripts");
let search = null;

async function ensureIndexReady() {
  if (search) return search;
  const episodes = await loadAllTranscripts(dataDir);
  if (episodes.length === 0) {
    throw new Error("No transcripts found. Ensure data/transcripts exists.");
  }
  const index = buildSearchIndex(episodes);
  search = index;
  return search;
}

app.post("/search", async (req, res) => {
  const { query, guest, limit, min_score } = req.body ?? {};
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "query is required" });
  }

  try {
    const index = await ensureIndexReady();
    const results = searchIndex(index, query, {
      guest,
      limit: typeof limit === "number" ? limit : 5,
      minScore: typeof min_score === "number" ? min_score : 0.1,
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

    return res.json({ results: quotes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return res.status(500).json({ error: message });
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("HTTP wrapper listening on port " + PORT);
});
