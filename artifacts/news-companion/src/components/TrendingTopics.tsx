import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const BASE_URL = import.meta.env.BASE_URL;

interface Chip {
  label: string;
  emoji: string;
  query: string;
}

function getEmoji(text: string): string {
  const t = text.toLowerCase();
  if (/war|conflict|military|attack|strike|battle/.test(t)) return "🌍";
  if (/ai|artificial intelligence|tech|robot|openai|google|microsoft|apple/.test(t)) return "🤖";
  if (/crypto|bitcoin|market|stock|economy|dollar|inflation/.test(t)) return "💰";
  if (/space|nasa|rocket|moon|mars|satellite/.test(t)) return "🚀";
  if (/sport|football|soccer|basketball|tennis|olympic/.test(t)) return "⚽";
  if (/climate|weather|storm|earthquake|flood/.test(t)) return "🌪️";
  if (/health|covid|cancer|vaccine|disease/.test(t)) return "🏥";
  if (/politic|election|president|congress|senate/.test(t)) return "🏛️";
  return "📰";
}

function trimTitle(title: string): string {
  const words = title.split(" ");
  return words.slice(0, 5).join(" ") + (words.length > 5 ? "..." : "");
}

interface TrendingTopicsProps {
  onTopicSelect: (query: string) => void;
  hidden: boolean;
}

export function TrendingTopics({ onTopicSelect, hidden }: TrendingTopicsProps) {
  const [chips, setChips] = useState<Chip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "top world news today breaking" }),
    })
      .then((r) => r.json())
      .then((data) => {
        const cards = data.cards || [];
        const newChips: Chip[] = cards.slice(0, 6).map((c: { title: string; url: string }) => ({
          label: trimTitle(c.title),
          emoji: getEmoji(c.title),
          query: c.title,
        }));
        setChips(newChips);
      })
      .catch(() => setChips([]))
      .finally(() => setLoading(false));
  }, []);

  if (hidden) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="w-full"
    >
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {loading
          ? [0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.2 }}
                className="shrink-0 h-8 w-28 rounded-full bg-white/6"
              />
            ))
          : chips.map((chip, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => onTopicSelect(chip.query)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/70 hover:text-white transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  whiteSpace: "nowrap",
                }}
                whileHover={{
                  background: "rgba(124,58,237,0.15)",
                  borderColor: "rgba(124,58,237,0.4)",
                }}
                whileTap={{ scale: 0.96 }}
              >
                <span>{chip.emoji}</span>
                <span>{chip.label}</span>
              </motion.button>
            ))}
      </div>
    </motion.div>
  );
}
