import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { CardData } from "../store/useAppStore";

interface NewsCardProps {
  card: CardData;
  index: number;
  onClick: (card: CardData) => void;
}

function getFavicon(source: string) {
  return `https://www.google.com/s2/favicons?sz=32&domain=${source}`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return null;
  }
}

export function NewsCard({ card, index, onClick }: NewsCardProps) {
  const timeAgo = formatDate(card.publishedDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      onClick={() => onClick(card)}
      className="group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer shrink-0"
      style={{
        width: "260px",
        background: "#111118",
        border: "1px solid rgba(255,255,255,0.07)",
        transition: "border-color 0.2s, transform 0.2s",
      }}
      whileHover={{ scale: 1.01, borderColor: "rgba(124,58,237,0.4)" }}
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
        {card.image ? (
          <img
            src={card.image}
            alt={card.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background:
                "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 p-3">
        {/* Source + time */}
        <div className="flex items-center gap-1.5">
          {card.source && (
            <img
              src={getFavicon(card.source)}
              alt={card.source}
              className="w-3.5 h-3.5 rounded-sm"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <span className="text-white/40 text-xs">{card.source}</span>
          {timeAgo && (
            <>
              <span className="text-white/20 text-xs">·</span>
              <span className="text-white/30 text-xs">{timeAgo}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h3
          className="text-white text-sm font-semibold leading-snug"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {card.title}
        </h3>

        {/* Description */}
        <p
          className="text-white/45 text-xs leading-relaxed"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {card.description}
        </p>

        {/* Read more */}
        <a
          href={card.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-violet-400 text-xs font-medium hover:text-violet-300 transition-colors mt-0.5"
        >
          Read more →
        </a>
      </div>
    </motion.div>
  );
}
