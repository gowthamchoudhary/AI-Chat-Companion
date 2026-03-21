import { useRef } from "react";
import { motion } from "framer-motion";

interface VerdictCardProps {
  verdict: string;
  topic: string;
  onDebateAgain: () => void;
  onNewTopic: () => void;
}

export function VerdictCard({ verdict, topic, onDebateAgain, onNewTopic }: VerdictCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const lines = verdict.split("\n").filter(Boolean);
  const analystPoints: string[] = [];
  const advocatePoints: string[] = [];
  let verdictLine = "";
  let currentSection = "";

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes("analyst") && !lower.includes("advocate")) currentSection = "analyst";
    else if (lower.includes("advocate")) currentSection = "advocate";
    else if (lower.includes("verdict") || lower.includes("stronger case") || lower.includes("winner")) currentSection = "verdict";

    if (currentSection === "analyst" && line.trim().startsWith("•")) {
      analystPoints.push(line.trim().replace(/^•\s*/, ""));
    } else if (currentSection === "advocate" && line.trim().startsWith("•")) {
      advocatePoints.push(line.trim().replace(/^•\s*/, ""));
    } else if (currentSection === "verdict" && !lower.includes("verdict:")) {
      verdictLine += line + " ";
    }
  }
  if (!verdictLine) verdictLine = lines[lines.length - 1] || verdict;

  const handleShare = async () => {
    try {
      const { default: html2canvas } = await import("html2canvas");
      if (!cardRef.current) return;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0a0a0f",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = "debate-verdict.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Share failed", e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg flex flex-col gap-3"
    >
      {/* Shareable card content */}
      <div
        ref={cardRef}
        className="rounded-2xl p-5 flex flex-col gap-4"
        style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-wide">Debate Summary</h2>
          {topic && (
            <span className="text-xs text-white/30 italic truncate max-w-[180px]">{topic}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              📊 The Analyst
            </div>
            {analystPoints.length > 0 ? (
              analystPoints.slice(0, 2).map((p, i) => (
                <div key={i} className="text-xs text-white/70 rounded-xl p-2" style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)" }}>
                  • {p}
                </div>
              ))
            ) : (
              <div className="text-xs text-white/30 italic">No data points</div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-red-400 uppercase tracking-wider">
              ❤️ The Advocate
            </div>
            {advocatePoints.length > 0 ? (
              advocatePoints.slice(0, 2).map((p, i) => (
                <div key={i} className="text-xs text-white/70 rounded-xl p-2" style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)" }}>
                  • {p}
                </div>
              ))
            ) : (
              <div className="text-xs text-white/30 italic">No points</div>
            )}
          </div>
        </div>

        <div className="rounded-xl p-3 text-sm text-white/80 text-center italic" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)" }}>
          {verdictLine.trim() || verdict}
        </div>

        <div className="text-center text-white/20 text-xs">AI News Companion</div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={onDebateAgain}
          className="flex-1 py-2.5 rounded-xl text-white/60 text-sm hover:bg-white/5 transition-colors"
          style={{ border: "1px solid rgba(255,255,255,0.12)" }}
        >
          Debate Again
        </button>
        <button
          onClick={handleShare}
          className="flex-1 py-2.5 rounded-xl text-white/80 text-sm font-medium hover:bg-white/8 transition-colors flex items-center justify-center gap-1.5"
          style={{ border: "1px solid rgba(255,255,255,0.15)" }}
        >
          📤 Share
        </button>
        <button
          onClick={onNewTopic}
          className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-colors"
          style={{ background: "rgb(124,58,237)" }}
        >
          New Topic
        </button>
      </div>
    </motion.div>
  );
}
