import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.MCP_SERVER_URL;
  const healthUrl = baseUrl ? `${baseUrl}/health` : null;
  const timeoutMs = 3000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    if (!healthUrl) {
      throw new Error("MCP_SERVER_URL is not set");
    }

    await fetch(healthUrl, {
      method: "GET",
      signal: controller.signal,
    });

    console.log("Keepalive pinged:", healthUrl);
  } catch (error) {
    console.error("Keepalive ping failed:", error);
  } finally {
    clearTimeout(timeoutId);
  }

  return NextResponse.json({ status: "pinged" });
}
