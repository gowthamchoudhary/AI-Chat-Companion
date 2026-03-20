import { motion } from "framer-motion";
import { useAppStore, Message } from "../store/useAppStore";

interface DebateArenaProps {
  onJumpIn: () => void;
}

function AgentPanel({
  role,
  messages,
  isActive,
}: {
  role: "analyst" | "advocate";
  messages: Message[];
  isActive: boolean;
}) {
  const isAnalyst = role === "analyst";
  const color = isAnalyst ? "blue" : "red";
  const name = isAnalyst ? "The Analyst" : "The Advocate";
  const emoji = isAnalyst ? "📊" : "❤️";

  return (
    <div
      className={`flex-1 flex flex-col gap-3 rounded-2xl p-4 border transition-all duration-300 ${
        isActive
          ? isAnalyst
            ? "bg-blue-600/15 border-blue-600/50 shadow-lg shadow-blue-600/10"
            : "bg-red-600/15 border-red-600/50 shadow-lg shadow-red-600/10"
          : "bg-white/3 border-white/10"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <span
          className={`font-semibold text-sm ${isAnalyst ? "text-blue-400" : "text-red-400"}`}
        >
          {name}
        </span>
        {isActive && (
          <motion.div
            className={`ml-auto w-2 h-2 rounded-full ${isAnalyst ? "bg-blue-400" : "bg-red-400"}`}
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </div>

      <div className="flex flex-col gap-2 max-h-36 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-white/20 text-xs italic">Waiting to speak...</div>
        ) : (
          messages.slice(-3).map((m, i) => (
            <div
              key={i}
              className={`text-xs text-white/80 rounded-xl p-2 ${
                isAnalyst ? "bg-blue-600/10" : "bg-red-600/10"
              }`}
            >
              {m.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function DebateArena({ onJumpIn }: DebateArenaProps) {
  const transcript = useAppStore((s) => s.transcript);
  const activeAgent = useAppStore((s) => s.activeAgent);

  const analystMessages = transcript.filter((m) => m.role === "analyst");
  const advocateMessages = transcript.filter((m) => m.role === "advocate");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col gap-4"
    >
      <div className="flex items-stretch gap-3">
        <AgentPanel
          role="analyst"
          messages={analystMessages}
          isActive={activeAgent === "analyst"}
        />

        <div className="flex items-center justify-center w-10">
          <span className="text-white/30 font-bold text-sm">VS</span>
        </div>

        <AgentPanel
          role="advocate"
          messages={advocateMessages}
          isActive={activeAgent === "advocate"}
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={onJumpIn}
          className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/15 transition-all"
        >
          🎤 Jump In
        </button>
      </div>
    </motion.div>
  );
}
