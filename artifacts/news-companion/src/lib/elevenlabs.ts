import { Conversation } from "@elevenlabs/client";

export type AgentMode = "companion" | "analyst" | "advocate";

export interface ConversationCallbacks {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (msg: { message: string; source: string }) => void;
  onModeChange?: (mode: { mode: string }) => void;
  onError?: (err: string) => void;
}

export async function getSignedUrl(agentMode: AgentMode): Promise<string> {
  const res = await fetch(`${import.meta.env.BASE_URL}api/agent-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentMode }),
  });
  if (!res.ok) throw new Error("Failed to get agent token");
  const data = await res.json();
  return data.signedUrl;
}

export async function startConversation(
  agentMode: AgentMode,
  callbacks: ConversationCallbacks
): Promise<Conversation> {
  const signedUrl = await getSignedUrl(agentMode);

  const conversation = await Conversation.startSession({
    signedUrl,
    onConnect: callbacks.onConnect,
    onDisconnect: callbacks.onDisconnect,
    onMessage: callbacks.onMessage,
    onModeChange: callbacks.onModeChange,
    onError: callbacks.onError,
  });

  return conversation;
}
