import { motion } from "framer-motion";

interface VerdictCardProps {
  verdict: string;
  onDebateAgain: () => void;
  onNewTopic: () => void;
}

export function VerdictCard({ verdict, onDebateAgain, onNewTopic }: VerdictCardProps) {
  const lines = verdict.split("\n").filter(Boolean);

  const analystPoints: string[] = [];
  const advocatePoints: string[] = [];
  let verdictLine = "";
  let currentSection = "";

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes("analyst") && !lower.includes("advocate")) {
      currentSection = "analyst";
    } else if (lower.includes("advocate")) {
      currentSection = "advocate";
    } else if (lower.includes("verdict") || lower.includes("stronger case") || lower.includes("winner")) {
      currentSection = "verdict";
    }

    if (currentSection === "analyst" && line.trim().startsWith("•")) {
      analystPoints.push(line.trim().replace("•", "").trim());
    } else if (currentSection === "advocate" && line.trim().startsWith("•")) {
      advocatePoints.push(line.trim().replace("•", "").trim());
    } else if (currentSection === "verdict" && !lower.includes("verdict:")) {
      verdictLine += line + " ";
    }
  }

  if (!verdictLine) {
    verdictLine = lines[lines.length - 1] || "";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col gap-4"
    >
      <h2 className="text-lg font-bold text-white text-center tracking-wide">
        Debate Summary
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            The Analyst
          </div>
          {analystPoints.length > 0 ? (
            analystPoints.slice(0, 2).map((p, i) => (
              <div key={i} className="text-xs text-white/70 bg-blue-600/10 border border-blue-600/20 rounded-xl p-2">
                • {p}
              </div>
            ))
          ) : (
            <div className="text-xs text-white/40 italic">Analysing...</div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold text-red-400 uppercase tracking-wider">
            The Advocate
          </div>
          {advocatePoints.length > 0 ? (
            advocatePoints.slice(0, 2).map((p, i) => (
              <div key={i} className="text-xs text-white/70 bg-red-600/10 border border-red-600/20 rounded-xl p-2">
                • {p}
              </div>
            ))
          ) : (
            <div className="text-xs text-white/40 italic">Advocating...</div>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-violet-600/10 border border-violet-600/30 p-3 text-sm text-white/80 text-center italic">
        {verdictLine.trim() || verdict}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onDebateAgain}
          className="flex-1 py-2 rounded-xl border border-white/20 text-white/70 text-sm hover:bg-white/5 transition-colors"
        >
          Debate Again
        </button>
        <button
          onClick={onNewTopic}
          className="flex-1 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          New Topic
        </button>
      </div>
    </motion.div>
  );
}
