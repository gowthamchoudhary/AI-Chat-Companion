import FirecrawlApp from "@mendable/firecrawl-js";

const apiKey = process.env.FIRECRAWL_API_KEY || "";

let fc: FirecrawlApp | null = null;

function getClient(): FirecrawlApp {
  if (!fc) {
    fc = new FirecrawlApp({ apiKey });
  }
  return fc;
}

export async function searchWeb(query: string): Promise<string> {
  try {
    if (!apiKey) return "Search unavailable: FIRECRAWL_API_KEY not configured.";
    const client = getClient();
    const results = await client.search(query, { limit: 5 });
    if (!results.success || !results.data || results.data.length === 0) {
      return "No results found.";
    }
    return results.data
      .map((r: { title?: string; description?: string; url?: string }) =>
        `${r.title || "Untitled"}: ${r.description || r.url || ""}`
      )
      .join("\n");
  } catch (err) {
    return "No results found.";
  }
}
