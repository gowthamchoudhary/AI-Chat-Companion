import { Router, type IRouter } from "express";
import { searchWeb } from "../lib/firecrawl.js";

const router: IRouter = Router();

router.post("/search", async (req, res) => {
  const { query } = req.body as { query?: string };
  if (!query || typeof query !== "string") {
    res.status(400).json({ error: "query is required" });
    return;
  }
  const result = await searchWeb(query);
  res.json({ result });
});

export default router;
