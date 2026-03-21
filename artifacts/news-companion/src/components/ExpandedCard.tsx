import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardData } from "../store/useAppStore";

const BASE_URL = import.meta.env.BASE_URL;

interface ExpandedCardProps {
  card: CardData | null;
  onClose: () => void;
}

export function ExpandedCard({ card, onClose }: ExpandedCardProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!card) { setContent(null); return; }
    setLoading(true);
    setContent(null);
    fetch(`${BASE_URL}api/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: card.url }),
    })
      .then((r) => r.json())
      .then((d) => setContent(d.content || null))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [card]);

  return (
    <AnimatePresence>
      {card && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl overflow-hidden flex flex-col"
            style={{
              background: "#111118",
              border: "1px solid rgba(255,255,255,0.1)",
              maxHeight: "85vh",
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              ✕
            </button>

            {/* Image */}
            {card.image && (
              <div className="w-full shrink-0" style={{ aspectRatio: "16/9" }}>
                <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Content */}
            <div className="flex flex-col gap-3 p-5 overflow-y-auto">
              {/* Source */}
              <div className="flex items-center gap-2">
                {card.source && (
                  <img
                    src={`https://www.google.com/s2/favicons?sz=32&domain=${card.source}`}
                    alt={card.source}
                    className="w-4 h-4 rounded-sm"
                  />
                )}
                <span className="text-white/40 text-xs">{card.source}</span>
              </div>

              {/* Title */}
              <h2 className="text-white text-lg font-bold leading-snug">{card.title}</h2>

              {/* Description */}
              <p className="text-white/60 text-sm leading-relaxed">{card.description}</p>

              {/* Full content */}
              {loading && (
                <div className="flex items-center gap-2 text-white/30 text-xs">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-violet-400"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                  Loading full article...
                </div>
              )}
              {content && !loading && (
                <div className="text-white/55 text-xs leading-relaxed border-t border-white/8 pt-3 whitespace-pre-wrap line-clamp-[20]">
                  {content.slice(0, 1500)}
                  {content.length > 1500 && "..."}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <a
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium text-center hover:bg-violet-700 transition-colors"
                >
                  Open Source →
                </a>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-white/15 text-white/60 text-sm hover:bg-white/5 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
