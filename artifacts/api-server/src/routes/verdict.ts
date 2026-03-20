import { Router, type IRouter } from "express";
import OpenAI from "openai";

const router: IRouter = Router();

const grokClient = new OpenAI({
  apiKey: process.env.GROK_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

interface Message {
  role: string;
  text: string;
}

router.post("/verdict", async (req, res) => {
  const { transcript } = req.body as { transcript?: Message[] };
  if (!transcript || !Array.isArray(transcript)) {
    res.status(400).json({ error: "transcript is required" });
    return;
  }

  if (!process.env.GROK_API_KEY) {
    res.json({
      verdict:
        "**Verdict unavailable** — Grok API key not configured.\n\nBoth debaters made compelling arguments. Add your GROK_API_KEY to get an AI-generated verdict.",
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
  } catch (err) {
    res.status(500).json({ error: "Failed to generate verdict" });
  }
});

export default router;
