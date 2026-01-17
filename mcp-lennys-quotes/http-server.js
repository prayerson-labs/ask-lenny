import express from "express";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const PORT = process.env.PORT || 8080;
const TOOL_NAME = "lennys_quotes.search";

const app = express();
app.use(express.json({ limit: "1mb" }));

const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/index.js"],
  cwd: process.cwd(),
  stderr: "inherit",
});

const client = new Client({ name: "lennys-quotes-http", version: "1.0.0" });

async function ensureConnected() {
  if (!client.transport) {
    await client.connect(transport);
  }
}

app.post("/search", async (req, res) => {
  const { query, guest, limit, min_score } = req.body ?? {};
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "query is required" });
  }

  try {
    await ensureConnected();
    let result;
    try {
      result = await client.callTool({
        name: TOOL_NAME,
        arguments: { query, guest, limit, min_score },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.toLowerCase().includes("tool not found")) {
        result = await client.callTool({
          name: "search_quotes",
          arguments: { query, guest, limit, min_score },
        });
      } else {
        throw error;
      }
    }

    return res.json({
      tool: TOOL_NAME,
      result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return res.status(500).json({ error: message });
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`HTTP wrapper listening on port ${PORT}`);
});

process.on("SIGTERM", async () => {
  await client.close();
  process.exit(0);
});
