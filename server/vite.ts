import { type Express } from "express";
import { type Server } from "http";
import { serveStatic } from "./static";

// In development we serve the pre-built news companion static files
// just like production — no Vite HMR for this setup.
export async function setupVite(_server: Server, app: Express) {
  serveStatic(app);
}
