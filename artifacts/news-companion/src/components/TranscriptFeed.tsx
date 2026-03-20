import { useEffect, useRef } from "react";
import { useAppStore, Message } from "../store/useAppStore";

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const roleColors: Record<Message["role"], string> = {
  user: "text-white/90",
  companion: "text-violet-400",
  analyst: "text-blue-400",
  advocate: "text-red-400",
};

const roleLabels: Record<string, string> = {
  user: "You",
  companion: "",
  analyst: "The Analyst",
  advocate: "The Advocate",
};

interface TranscriptFeedProps {
  companionName?: string;
}

export function TranscriptFeed({ companionName }: TranscriptFeedProps) {
  const transcript = useAppStore((s) => s.transcript);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const getLabel = (role: Message["role"]) => {
    if (role === "companion") return companionName || "Companion";
    return roleLabels[role] || role;
  };

  if (transcript.length === 0) {
    return (
      <div className="text-center text-white/20 text-sm py-4">
        Your conversation will appear here...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
      {transcript.map((msg, i) => (
        <div
          key={i}
          className={`flex flex-col gap-0.5 ${msg.role === "user" ? "items-end" : "items-start"}`}
        >
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${roleColors[msg.role]}`}>
              {getLabel(msg.role)}
            </span>
            <span className="text-white/20 text-xs">{formatTime(msg.timestamp)}</span>
          </div>
          <div
            className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-white/10 text-white rounded-tr-sm"
                : msg.role === "analyst"
                  ? "bg-blue-600/20 text-white/90 rounded-tl-sm border border-blue-600/20"
                  : msg.role === "advocate"
                    ? "bg-red-600/20 text-white/90 rounded-tl-sm border border-red-600/20"
                    : "bg-violet-600/20 text-white/90 rounded-tl-sm border border-violet-600/20"
            }`}
          >
            {msg.text}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
