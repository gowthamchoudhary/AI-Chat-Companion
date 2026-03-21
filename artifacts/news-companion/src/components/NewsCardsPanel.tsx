import { AnimatePresence, motion } from "framer-motion";
import { CardData } from "../store/useAppStore";
import { NewsCard } from "./NewsCard";

interface NewsCardsPanelProps {
  cards: CardData[];
  isVisible: boolean;
  isSearching: boolean;
  onCardClick: (card: CardData) => void;
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.4, repeat: Infinity, delay: index * 0.15 }}
      className="rounded-2xl overflow-hidden shrink-0"
      style={{
        width: "260px",
        background: "#111118",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="w-full bg-white/5" style={{ aspectRatio: "16/9" }} />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-2.5 bg-white/8 rounded-full w-1/2" />
        <div className="h-3 bg-white/10 rounded-full w-full" />
        <div className="h-3 bg-white/8 rounded-full w-4/5" />
        <div className="h-2.5 bg-white/5 rounded-full w-3/4" />
      </div>
    </motion.div>
  );
}

export function NewsCardsPanel({ cards, isVisible, isSearching, onCardClick }: NewsCardsPanelProps) {
  const showSkeletons = isSearching && cards.length === 0;
  const show = isVisible && (cards.length > 0 || isSearching);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full"
    >
      {isSearching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 mb-2 px-1"
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-violet-400"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
          />
          <span className="text-white/40 text-xs tracking-wide">Searching the web...</span>
        </motion.div>
      )}

      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <AnimatePresence mode="popLayout">
          {showSkeletons
            ? [0, 1, 2].map((i) => <SkeletonCard key={`sk-${i}`} index={i} />)
            : cards.slice(0, 5).map((card, i) => (
                <NewsCard key={card.url || i} card={card} index={i} onClick={onCardClick} />
              ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
