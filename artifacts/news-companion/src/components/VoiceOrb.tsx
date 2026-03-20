import { motion } from "framer-motion";
import { useAppStore } from "../store/useAppStore";

export function VoiceOrb() {
  const isListening = useAppStore((s) => s.isListening);
  const isSpeaking = useAppStore((s) => s.isSpeaking);
  const activeAgent = useAppStore((s) => s.activeAgent);

  const getOrbColor = () => {
    if (activeAgent === "analyst") return "#2563EB";
    if (activeAgent === "advocate") return "#DC2626";
    return "#7C3AED";
  };

  const color = getOrbColor();

  const orbVariants = {
    idle: {
      scale: [1, 1.04, 1],
      opacity: [0.7, 0.85, 0.7],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    listening: {
      scale: [1.05, 1.15, 1.05],
      opacity: [0.9, 1, 0.9],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    speaking: {
      scale: [1.1, 1.2, 1.08, 1.18, 1.1],
      opacity: [1, 0.95, 1, 0.9, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const state = isSpeaking ? "speaking" : isListening ? "listening" : "idle";

  return (
    <div className="relative flex items-center justify-center w-56 h-56">
      {/* Outer glow rings */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "100%",
          height: "100%",
          background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
        }}
        animate={
          isSpeaking
            ? { scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }
            : isListening
              ? { scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }
              : { scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }
        }
        transition={{ duration: isSpeaking ? 0.7 : 2.5, repeat: Infinity }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "80%",
          height: "80%",
          background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
        }}
        animate={
          isSpeaking
            ? { scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }
            : isListening
              ? { scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }
              : { scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }
        }
        transition={{
          duration: isSpeaking ? 0.9 : 2,
          repeat: Infinity,
          delay: 0.2,
        }}
      />

      {/* Core orb */}
      <motion.div
        className="relative rounded-full cursor-pointer"
        style={{
          width: "60%",
          height: "60%",
          background: `radial-gradient(circle at 35% 35%, ${color}ff, ${color}88 60%, ${color}44 100%)`,
          boxShadow: `0 0 40px ${color}66, 0 0 80px ${color}33, inset 0 0 20px ${color}22`,
        }}
        variants={orbVariants}
        animate={state}
      />

      {/* State label */}
      <div className="absolute -bottom-8 text-xs tracking-widest uppercase text-white/40 font-mono">
        {isSpeaking ? "speaking" : isListening ? "listening" : "ready"}
      </div>
    </div>
  );
}
