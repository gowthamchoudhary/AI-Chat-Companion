import { useEffect, useRef } from "react";
import { useAppStore, Message } from "../store/useAppStore";

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
    <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-1" style={{ scrollbarWidth: "none" }}>
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
          {/* Source badges */}
          {msg.sources && msg.sources.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5 max-w-[85%]">
              {msg.sources.map((src, si) => (
                <a
                  key={si}
                  href={`https://${src}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded text-white/40 text-xs hover:text-white/70 transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <img
                    src={`https://www.google.com/s2/favicons?sz=16&domain=${src}`}
                    alt={src}
                    className="w-3 h-3"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  {src}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
