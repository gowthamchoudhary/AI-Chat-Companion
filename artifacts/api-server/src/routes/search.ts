import { Router, type IRouter } from "express";
import FirecrawlApp from "@mendable/firecrawl-js";

const router: IRouter = Router();

interface SearchResult {
  title?: string;
  description?: string;
  url?: string;
  metadata?: {
    ogImage?: string;
    image?: string;
    publishedDate?: string;
  };
}

interface FirecrawlSearchResponse {
  web?: SearchResult[];
  success?: boolean;
  data?: SearchResult[];
}

let fc: FirecrawlApp | null = null;
function getClient() {
  if (!fc) fc = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY || "" });
  return fc;
}

function extractSource(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
}

router.post("/search", async (req, res) => {
  const { query } = req.body as { query?: string };
  if (!query || typeof query !== "string") {
    res.status(400).json({ error: "query is required" });
    return;
  }

  if (!process.env.FIRECRAWL_API_KEY) {
    res.status(503).json({ result: "Search unavailable: FIRECRAWL_API_KEY not configured.", cards: [] });
    return;
  }

  try {
    const client = getClient();
    const results = (await client.search(query, { limit: 5 })) as FirecrawlSearchResponse;
    const items: SearchResult[] = results.web ?? results.data ?? [];

    const spokenText = items
      .slice(0, 3)
      .map((r) => `${r.title || "Untitled"}: ${r.description || ""}`)
      .join("\n");

    const cards = items.slice(0, 5).map((r) => ({
      title: r.title || "",
      description: r.description || "",
      url: r.url || "",
      image: r.metadata?.ogImage || r.metadata?.image || null,
      source: extractSource(r.url || ""),
      publishedDate: r.metadata?.publishedDate || null,
    }));

    res.json({ result: spokenText || "No results found.", cards });
  } catch {
    res.json({ result: "No results found.", cards: [] });
  }
});

export default router;
