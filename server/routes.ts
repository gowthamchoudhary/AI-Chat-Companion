import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

const grokClient = new OpenAI({
  apiKey: process.env.GROK_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

type AgentMode = "companion" | "analyst" | "advocate";

function getAgentId(mode: AgentMode): string {
  switch (mode) {
    case "companion":
      return process.env.COMPANION_AGENT_ID || "";
    case "analyst":
      return process.env.ANALYST_AGENT_ID || "";
    case "advocate":
      return process.env.ADVOCATE_AGENT_ID || "";
  }
}

function extractSource(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // --- Search ---
  app.get("/api/search", (_req, res) => {
    res.json({ status: "Search API is running" });
  });

  app.post("/api/search", async (req, res) => {
    const { query } = req.body as { query?: string };

    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "Query is required" });
      return;
    }

    if (!FIRECRAWL_API_KEY) {
      res.status(503).json({
        result: "Search unavailable: FIRECRAWL_API_KEY not configured.",
        cards: [],
      });
      return;
    }

    try {
      const response = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        },
        body: JSON.stringify({
          query,
          limit: 5,
          scrapeOptions: { formats: ["markdown"] },
        }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        data?: Array<{
          title?: string;
          description?: string;
          url?: string;
          metadata?: { ogImage?: string; image?: string; publishedDate?: string };
        }>;
      };

      if (!data.success) {
        res.status(500).json({ error: "Search failed", details: data });
        return;
      }

      const items = data.data ?? [];

      const result = items
        .slice(0, 3)
        .map((r) => `${r.title ?? "Untitled"}: ${r.description ?? ""}`)
        .join("\n");

      const cards = items.slice(0, 5).map((r) => ({
        title: r.title ?? "",
        description: r.description ?? "",
        url: r.url ?? "",
        image: r.metadata?.ogImage ?? r.metadata?.image ?? null,
        source: extractSource(r.url ?? ""),
        publishedDate: r.metadata?.publishedDate ?? null,
      }));

      res.json({ result: result || "No results found.", cards });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // --- Agent Token (ElevenLabs) ---
  app.post("/api/agent-token", async (req, res) => {
    const { agentMode } = req.body as { agentMode?: AgentMode };
    if (!agentMode || !["companion", "analyst", "advocate"].includes(agentMode)) {
      res.status(400).json({ error: "agentMode is required" });
      return;
    }

    const apiKey = process.env.ELEVENLABS_API_KEY || "";
    const agentId = getAgentId(agentMode);

    if (!apiKey || !agentId) {
      res.status(503).json({
        error: "ElevenLabs API key or agent ID not configured",
        signedUrl: null,
      });
      return;
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
        { headers: { "xi-api-key": apiKey } }
      );

      if (!response.ok) {
        const errText = await response.text();
        res.status(500).json({ error: `ElevenLabs error: ${errText}` });
        return;
      }

      const data = (await response.json()) as { signed_url: string };
      res.json({ signedUrl: data.signed_url });
    } catch {
      res.status(500).json({ error: "Failed to get signed URL" });
    }
  });

  // --- Verdict (Grok/Groq) ---
  app.post("/api/verdict", async (req, res) => {
    const { transcript } = req.body as { transcript?: { role: string; text: string }[] };
    if (!transcript || !Array.isArray(transcript)) {
      res.status(400).json({ error: "transcript is required" });
      return;
    }

    if (!process.env.GROK_API_KEY) {
      res.json({
        verdict:
          "**Verdict unavailable** — Grok API key not configured.\n\nBoth debaters made compelling arguments.",
      });
      return;
    }

    const formatted = transcript
      .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
      .join("\n");

    const prompt = `You are a debate judge. Here is the transcript of a debate between The Analyst (data-driven) and The Advocate (values-driven):\n\n${formatted}\n\nSummarise this debate. Give 2 bullet points for The Analyst's strongest arguments and 2 for The Advocate's. Then one line verdict: who made the stronger case and why. Be concise.`;

    try {
      const completion = await grokClient.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
      });

      const verdict = completion.choices[0]?.message?.content || "No verdict available.";
      res.json({ verdict });
    } catch {
      res.status(500).json({ error: "Failed to generate verdict" });
    }
  });

  return httpServer;
}
