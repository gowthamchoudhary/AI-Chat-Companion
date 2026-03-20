import FirecrawlApp from "@mendable/firecrawl-js";

const apiKey = process.env.FIRECRAWL_API_KEY || "";

let fc: FirecrawlApp | null = null;

function getClient(): FirecrawlApp {
  if (!fc) {
    fc = new FirecrawlApp({ apiKey });
  }
  return fc;
}

interface SearchResult {
  title?: string;
  description?: string;
  url?: string;
}

interface FirecrawlSearchResponse {
  web?: SearchResult[];
  success?: boolean;
  data?: SearchResult[];
}

export async function searchWeb(query: string): Promise<string> {
  try {
    if (!apiKey) return "Search unavailable: FIRECRAWL_API_KEY not configured.";
    const client = getClient();
    const results = (await client.search(query, { limit: 5 })) as FirecrawlSearchResponse;
    const items: SearchResult[] = results.web ?? results.data ?? [];
    if (items.length === 0) return "No results found.";
    return items
      .map((r) => `${r.title || "Untitled"}: ${r.description || r.url || ""}`)
      .join("\n");
  } catch {
    return "No results found.";
  }
}
