import { Router, type IRouter } from "express";

const router: IRouter = Router();

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

router.post("/agent-token", async (req, res) => {
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
      {
        headers: { "xi-api-key": apiKey },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      res.status(500).json({ error: `ElevenLabs error: ${errText}` });
      return;
    }

    const data = (await response.json()) as { signed_url: string };
    res.json({ signedUrl: data.signed_url });
  } catch (err) {
    res.status(500).json({ error: "Failed to get signed URL" });
  }
});

export default router;
