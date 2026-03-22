import express, { type Express } from "express";
import fs from "fs";
import path from "path";

function getNewsCompanionDist() {
  return path.resolve(process.cwd(), "artifacts", "news-companion", "dist", "public");
}

export function serveStatic(app: Express) {
  const distPath = getNewsCompanionDist();
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the news companion build at: ${distPath}. Run: pnpm --filter @workspace/news-companion run build`
    );
  }

  app.use(express.static(distPath));

  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
