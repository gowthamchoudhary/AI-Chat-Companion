import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Conversation } from "@elevenlabs/client";
import { useAppStore, AppMode } from "../store/useAppStore";
import { VoiceOrb } from "./VoiceOrb";
import { ModeBar } from "./ModeBar";
import { TranscriptFeed } from "./TranscriptFeed";
import { DebateArena } from "./DebateArena";
import { VerdictCard } from "./VerdictCard";

const BASE_URL = import.meta.env.BASE_URL;

export function CompanionScreen() {
  const {
    companionName,
    mode,
    setMode,
    setIsListening,
    setIsSpeaking,
    setActiveAgent,
    addMessage,
    setTranscript,
    setIsDebateActive,
    transcript,
  } = useAppStore();

  const [verdict, setVerdict] = useState<string | null>(null);
  const [debateExchanges, setDebateExchanges] = useState(0);
  const [isMicActive, setIsMicActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");

  const conversationRef = useRef<Conversation | null>(null);
  const analystConvRef = useRef<Conversation | null>(null);
  const advocateConvRef = useRef<Conversation | null>(null);

  const disconnectAll = useCallback(async () => {
    if (conversationRef.current) {
      await conversationRef.current.endSession();
      conversationRef.current = null;
    }
    if (analystConvRef.current) {
      await analystConvRef.current.endSession();
      analystConvRef.current = null;
    }
    if (advocateConvRef.current) {
      await advocateConvRef.current.endSession();
      advocateConvRef.current = null;
    }
    setIsListening(false);
    setIsSpeaking(false);
    setConnectionStatus("idle");
  }, [setIsListening, setIsSpeaking]);

  const startCompanionSession = useCallback(async () => {
    await disconnectAll();
    setConnectionStatus("connecting");
    try {
      const res = await fetch(`${BASE_URL}api/agent-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentMode: "companion" }),
      });
      const data = await res.json();
      if (!data.signedUrl) throw new Error(data.error || "No signed URL");

      const conv = await Conversation.startSession({
        signedUrl: data.signedUrl,
        onConnect: () => {
          setConnectionStatus("connected");
          setActiveAgent("companion");
        },
        onDisconnect: () => {
          setConnectionStatus("idle");
          setIsListening(false);
          setIsSpeaking(false);
        },
        onMessage: (msg: { message: string; source: string }) => {
          if (msg.source === "ai") {
            addMessage({ role: "companion", text: msg.message, timestamp: Date.now() });
          } else if (msg.source === "user") {
            addMessage({ role: "user", text: msg.message, timestamp: Date.now() });
          }
        },
        onModeChange: (modeData: { mode: string }) => {
          setIsListening(modeData.mode === "listening");
          setIsSpeaking(modeData.mode === "speaking");
        },
        onError: () => setConnectionStatus("error"),
      });
      conversationRef.current = conv;
    } catch {
      setConnectionStatus("error");
    }
  }, [disconnectAll, addMessage, setActiveAgent, setIsListening, setIsSpeaking]);

  const startDebateMeSession = useCallback(async () => {
    await disconnectAll();
    setConnectionStatus("connecting");
    try {
      const res = await fetch(`${BASE_URL}api/agent-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentMode: "analyst" }),
      });
      const data = await res.json();
      if (!data.signedUrl) throw new Error(data.error || "No signed URL");

      const conv = await Conversation.startSession({
        signedUrl: data.signedUrl,
        onConnect: () => {
          setConnectionStatus("connected");
          setActiveAgent("analyst");
          setIsDebateActive(true);
        },
        onDisconnect: () => {
          setConnectionStatus("idle");
          setIsListening(false);
          setIsSpeaking(false);
        },
        onMessage: (msg: { message: string; source: string }) => {
          if (msg.source === "ai") {
            addMessage({ role: "analyst", text: msg.message, timestamp: Date.now() });
          } else if (msg.source === "user") {
            addMessage({ role: "user", text: msg.message, timestamp: Date.now() });
          }
        },
        onModeChange: (modeData: { mode: string }) => {
          setIsListening(modeData.mode === "listening");
          setIsSpeaking(modeData.mode === "speaking");
        },
        onError: () => setConnectionStatus("error"),
      });
      conversationRef.current = conv;
    } catch {
      setConnectionStatus("error");
    }
  }, [disconnectAll, addMessage, setActiveAgent, setIsListening, setIsSpeaking, setIsDebateActive]);

  const startWatchDebateSession = useCallback(async () => {
    await disconnectAll();
    setConnectionStatus("connecting");
    setIsDebateActive(true);
    setVerdict(null);
    setDebateExchanges(0);
    addMessage({
      role: "analyst",
      text: "I'm The Analyst. Give me a topic and I'll give you the facts.",
      timestamp: Date.now(),
    });
    addMessage({
      role: "advocate",
      text: "I'm The Advocate. What are we fighting for today?",
      timestamp: Date.now(),
    });
    setConnectionStatus("connected");
    setActiveAgent("analyst");
  }, [disconnectAll, addMessage, setActiveAgent, setIsDebateActive]);

  const fetchVerdict = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}api/verdict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();
      setVerdict(data.verdict || "No verdict available.");
    } catch {
      setVerdict("Could not generate verdict. Check your OpenAI API key.");
    }
  }, [transcript]);

  useEffect(() => {
    if (mode === "watch-debate" && debateExchanges >= 4 && !verdict) {
      fetchVerdict();
    }
  }, [debateExchanges, mode, verdict, fetchVerdict]);

  const handleModeChange = useCallback(
    async (newMode: AppMode) => {
      setVerdict(null);
      setIsDebateActive(false);
      setDebateExchanges(0);
      if (newMode === "chat") await startCompanionSession();
      else if (newMode === "debate-me") await startDebateMeSession();
      else if (newMode === "watch-debate") await startWatchDebateSession();
    },
    [startCompanionSession, startDebateMeSession, startWatchDebateSession, setIsDebateActive]
  );

  useEffect(() => {
    startCompanionSession();
    return () => { disconnectAll(); };
  }, []);

  const handleMicToggle = useCallback(async () => {
    if (!isMicActive && mode === "watch-debate") {
      setIsMicActive(true);
      setTimeout(() => setIsMicActive(false), 5000);
    }
  }, [isMicActive, mode]);

  const handleDebateAgain = () => {
    setVerdict(null);
    setTranscript([]);
    setDebateExchanges(0);
    startWatchDebateSession();
  };

  const handleNewTopic = () => {
    setVerdict(null);
    setTranscript([]);
    setDebateExchanges(0);
    setMode("chat");
    handleModeChange("chat");
  };

  const statusDot =
    connectionStatus === "connected"
      ? "bg-green-400"
      : connectionStatus === "connecting"
        ? "bg-yellow-400 animate-pulse"
        : connectionStatus === "error"
          ? "bg-red-400"
          : "bg-white/20";

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-between px-4 py-6 overflow-hidden">
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusDot}`} />
          <span className="text-white/40 text-xs uppercase tracking-widest font-mono">
            {connectionStatus}
          </span>
        </div>
        <div className="text-center">
          <h1 className="text-white font-semibold tracking-wide">
            {companionName || "Your Companion"}
          </h1>
        </div>
        <div className="w-20" />
      </div>

      {/* Orb */}
      <div className="flex-1 flex items-center justify-center">
        <VoiceOrb />
      </div>

      {/* Content area */}
      <div className="w-full max-w-lg flex flex-col gap-4">
        <AnimatePresence mode="wait">
          {verdict ? (
            <VerdictCard
              key="verdict"
              verdict={verdict}
              onDebateAgain={handleDebateAgain}
              onNewTopic={handleNewTopic}
            />
          ) : mode === "watch-debate" ? (
            <DebateArena key="arena" onJumpIn={handleMicToggle} />
          ) : (
            <motion.div
              key="transcript"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TranscriptFeed companionName={companionName} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode bar + mic */}
        <div className="flex items-center gap-3">
          <ModeBar onModeChange={handleModeChange} />

          {mode !== "watch-debate" && (
            <button
              onClick={handleMicToggle}
              className="w-11 h-11 rounded-full bg-violet-600 hover:bg-violet-700 flex items-center justify-center transition-all shadow-lg shadow-violet-600/30 shrink-0"
            >
              <span className="text-lg">🎤</span>
            </button>
          )}
        </div>

        {connectionStatus === "error" && (
          <div className="text-center text-red-400/70 text-xs">
            Connection failed — check your ElevenLabs API keys in Secrets
          </div>
        )}
      </div>
    </div>
  );
}
