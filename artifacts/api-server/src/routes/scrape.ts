import { Router, type IRouter } from "express";
import FirecrawlApp from "@mendable/firecrawl-js";

const router: IRouter = Router();

router.post("/scrape", async (req, res) => {
  const { url } = req.body as { url?: string };
  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "url is required" });
    return;
  }

  const apiKey = process.env.FIRECRAWL_API_KEY || "";
  if (!apiKey) {
    res.status(503).json({ error: "FIRECRAWL_API_KEY not configured" });
    return;
  }

  try {
    const fc = new FirecrawlApp({ apiKey });
    const result = await fc.scrapeUrl(url, { formats: ["markdown"] });
    const content =
      (result as { markdown?: string }).markdown ||
      "Could not retrieve article content.";
    res.json({ content });
  } catch {
    res.status(500).json({ error: "Failed to scrape URL" });
  }
});

export default router;
