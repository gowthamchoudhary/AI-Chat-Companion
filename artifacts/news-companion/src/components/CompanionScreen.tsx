import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Conversation } from "@elevenlabs/client";
import { useAppStore, AppMode, CardData } from "../store/useAppStore";
import { VoiceOrb } from "./VoiceOrb";
import { ModeBar } from "./ModeBar";
import { TranscriptFeed } from "./TranscriptFeed";
import { DebateArena } from "./DebateArena";
import { VerdictCard } from "./VerdictCard";
import { NewsCardsPanel } from "./NewsCardsPanel";
import { ExpandedCard } from "./ExpandedCard";
import { TrendingTopics } from "./TrendingTopics";

const BASE_URL = import.meta.env.BASE_URL;

type StatusType = "idle" | "connecting" | "connected" | "listening" | "speaking" | "searching" | "error";

export function CompanionScreen() {
  const {
    companionName, mode, setMode,
    setIsListening, setIsSpeaking, setIsSearching,
    setActiveAgent, addMessage, setTranscript,
    setIsDebateActive, isSearching, newsCards,
    setNewsCards, setCurrentQuery, setConversationStarted, conversationStarted,
    currentTopic,
  } = useAppStore();

  const [verdict, setVerdict] = useState<string | null>(null);
  const [isMicActive, setIsMicActive] = useState(false);
  const [status, setStatus] = useState<StatusType>("idle");
  const [expandedCard, setExpandedCard] = useState<CardData | null>(null);

  const conversationRef = useRef<Conversation | null>(null);

  const clientTools = {
    show_cards: (params: { cards: CardData[]; query: string }) => {
      setNewsCards(params.cards || []);
      setCurrentQuery(params.query || "");
      setIsSearching(false);
      return "Cards displayed successfully";
    },
  };

  const disconnectAll = useCallback(async () => {
    if (conversationRef.current) {
      await conversationRef.current.endSession().catch(() => {});
      conversationRef.current = null;
    }
    setIsListening(false);
    setIsSpeaking(false);
    setIsSearching(false);
    setStatus("idle");
  }, [setIsListening, setIsSpeaking, setIsSearching]);

  const startSession = useCallback(async (agentMode: "companion" | "analyst" | "advocate") => {
    await disconnectAll();
    setStatus("connecting");
    setNewsCards([]);
    try {
      const res = await fetch(`${BASE_URL}api/agent-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentMode }),
      });
      const data = await res.json();
      if (!data.signedUrl) throw new Error(data.error || "No signed URL");

      const role = agentMode === "companion" ? "companion" : agentMode === "analyst" ? "analyst" : "advocate";

      const conv = await Conversation.startSession({
        signedUrl: data.signedUrl,
        clientTools,
        onConnect: () => {
          setStatus("connected");
          setActiveAgent(agentMode);
        },
        onDisconnect: () => {
          setStatus("idle");
          setIsListening(false);
          setIsSpeaking(false);
        },
        onMessage: (msg: { message: string; source: string }) => {
          if (msg.source === "ai") {
            addMessage({ role, text: msg.message, timestamp: Date.now() });
            setConversationStarted(true);
          } else if (msg.source === "user") {
            addMessage({ role: "user", text: msg.message, timestamp: Date.now() });
            setIsSearching(true);
            setConversationStarted(true);
          }
        },
        onModeChange: (modeData: { mode: string }) => {
          const m = modeData.mode;
          setIsListening(m === "listening");
          setIsSpeaking(m === "speaking");
          if (m === "listening") setStatus("listening");
          else if (m === "speaking") { setStatus("speaking"); setIsSearching(false); }
          else setStatus("connected");
        },
        onError: () => setStatus("error"),
      });
      conversationRef.current = conv;
    } catch {
      setStatus("error");
    }
  }, [disconnectAll, addMessage, setActiveAgent, setIsListening, setIsSpeaking, setIsSearching, setNewsCards, setCurrentQuery, setConversationStarted]);

  const handleModeChange = useCallback(async (newMode: AppMode) => {
    setVerdict(null);
    setIsDebateActive(false);
    setNewsCards([]);
    if (newMode === "chat") await startSession("companion");
    else if (newMode === "debate-me") await startSession("analyst");
    else if (newMode === "watch-debate") {
      await disconnectAll();
      setIsDebateActive(true);
      setStatus("connected");
      setActiveAgent("analyst");
      addMessage({ role: "analyst", text: "I'm The Analyst. Give me a topic and I'll give you the facts.", timestamp: Date.now() });
      addMessage({ role: "advocate", text: "I'm The Advocate. What are we fighting for today?", timestamp: Date.now() });
    }
  }, [startSession, disconnectAll, addMessage, setActiveAgent, setIsDebateActive, setNewsCards]);

  const fetchVerdict = useCallback(async () => {
    const transcript = useAppStore.getState().transcript;
    try {
      const res = await fetch(`${BASE_URL}api/verdict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();
      setVerdict(data.verdict || "No verdict available.");
    } catch {
      setVerdict("Could not generate verdict.");
    }
  }, []);

  // Spacebar to talk
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        setIsMicActive(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setIsMicActive(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); };
  }, []);

  useEffect(() => {
    startSession("companion");
    return () => { disconnectAll(); };
  }, []);

  const handleTopicSelect = (query: string) => {
    setConversationStarted(true);
    setIsSearching(true);
    addMessage({ role: "user", text: query, timestamp: Date.now() });
  };

  const handleDebateAgain = () => {
    setVerdict(null);
    setTranscript([]);
    setNewsCards([]);
    handleModeChange("watch-debate");
  };

  const handleNewTopic = () => {
    setVerdict(null);
    setTranscript([]);
    setNewsCards([]);
    setMode("chat");
    handleModeChange("chat");
  };

  // Status display
  const statusConfig: Record<StatusType, { color: string; label: string }> = {
    idle: { color: "bg-white/20", label: "offline" },
    connecting: { color: "bg-yellow-400 animate-pulse", label: "connecting..." },
    connected: { color: "bg-green-400", label: "connected" },
    listening: { color: "bg-blue-400", label: "listening" },
    speaking: { color: "bg-violet-400", label: "speaking" },
    searching: { color: "bg-yellow-400 animate-pulse", label: "searching..." },
    error: { color: "bg-red-400", label: "error" },
  };

  const displayStatus = isSearching ? "searching" : status;
  const { color: dotColor, label: statusLabel } = statusConfig[displayStatus] || statusConfig.idle;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-between px-4 py-6 overflow-hidden relative">
      {/* LIVE badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-red-500"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <span className="text-red-400 text-xs font-bold tracking-widest">LIVE</span>
      </div>

      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${dotColor}`} />
          <span className="text-white/40 text-xs uppercase tracking-widest font-mono">{statusLabel}</span>
        </div>
        <div className="text-center">
          <h1 className="text-white font-semibold tracking-wide">{companionName || "Your Companion"}</h1>
        </div>
        <div className="w-24" />
      </div>

      {/* Orb */}
      <div className="flex-1 flex items-center justify-center">
        <VoiceOrb />
      </div>

      {/* Content area */}
      <div className="w-full max-w-lg flex flex-col gap-3">
        <AnimatePresence mode="wait">
          {verdict ? (
            <VerdictCard
              key="verdict"
              verdict={verdict}
              topic={currentTopic}
              onDebateAgain={handleDebateAgain}
              onNewTopic={handleNewTopic}
            />
          ) : mode === "watch-debate" ? (
            <DebateArena key="arena" onJumpIn={() => fetchVerdict()} />
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              {/* Trending topics — only before first message */}
              <TrendingTopics
                onTopicSelect={handleTopicSelect}
                hidden={conversationStarted}
              />

              {/* News cards */}
              <NewsCardsPanel
                cards={newsCards}
                isVisible={conversationStarted || newsCards.length > 0}
                isSearching={isSearching}
                onCardClick={setExpandedCard}
              />

              <TranscriptFeed companionName={companionName} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode bar + mic */}
        <div className="flex items-center gap-3">
          <ModeBar onModeChange={handleModeChange} />
          {mode !== "watch-debate" && (
            <button
              onMouseDown={() => setIsMicActive(true)}
              onMouseUp={() => setIsMicActive(false)}
              onTouchStart={() => setIsMicActive(true)}
              onTouchEnd={() => setIsMicActive(false)}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg shrink-0 ${
                isMicActive
                  ? "bg-red-500 shadow-red-500/30 scale-110"
                  : "bg-violet-600 hover:bg-violet-700 shadow-violet-600/30"
              }`}
            >
              <span className="text-lg">{isMicActive ? "🔴" : "🎤"}</span>
            </button>
          )}
        </div>

        <div className="text-center text-white/15 text-xs">
          Hold <kbd className="px-1 py-0.5 rounded bg-white/10 text-white/30 text-xs">Space</kbd> to talk
        </div>

        {status === "error" && (
          <div className="text-center text-red-400/70 text-xs">
            Connection failed — check your ElevenLabs API keys in Secrets
          </div>
        )}
      </div>

      {/* Expanded card modal */}
      <ExpandedCard card={expandedCard} onClose={() => setExpandedCard(null)} />
    </div>
  );
}
