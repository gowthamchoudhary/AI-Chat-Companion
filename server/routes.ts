import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

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

  return httpServer;
}
