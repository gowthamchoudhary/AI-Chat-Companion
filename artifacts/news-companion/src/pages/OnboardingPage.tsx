import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/useAppStore";
import { useLocation } from "wouter";

const VOICE_OPTIONS = [
  {
    id: "21m00Tcm4TlvDq8ikWAM",
    name: "Rachel",
    description: "Warm & friendly",
    emoji: "🌸",
  },
  {
    id: "pNInz6obpgDQGcFmaJgB",
    name: "Adam",
    description: "Deep & authoritative",
    emoji: "🔷",
  },
  {
    id: "EXAVITQu4vr4xnSDxMaL",
    name: "Bella",
    description: "Soft & calm",
    emoji: "🌙",
  },
  {
    id: "ErXwobaYiN019PkySvjV",
    name: "Antoni",
    description: "Sharp & confident",
    emoji: "⚡",
  },
  {
    id: "MF3mGyEYCl7XYWbV9V9",
    name: "Elli",
    description: "Clear & energetic",
    emoji: "✨",
  },
];

export function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [nameInput, setNameInput] = useState("");
  const { setCompanionName, setVoiceId, voiceId } = useAppStore();
  const [, navigate] = useLocation();

  const handleNameContinue = () => {
    if (!nameInput.trim()) return;
    setCompanionName(nameInput.trim());
    setStep(2);
  };

  const handleVoiceSelect = (id: string) => {
    setVoiceId(id);
    setTimeout(() => navigate("/companion"), 300);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-6">
      {/* Background orb glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-8 w-full max-w-sm"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">🌐</div>
              <h1 className="text-2xl font-bold text-white leading-tight">
                What do you want to call your AI companion?
              </h1>
              <p className="mt-2 text-white/40 text-sm">
                They'll answer any news question with live data
              </p>
            </div>

            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNameContinue()}
              placeholder="Nova, Alex, Sage..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/25 text-lg text-center focus:outline-none focus:border-violet-500/60 transition-colors"
              autoFocus
            />

            <button
              onClick={handleNameContinue}
              disabled={!nameInput.trim()}
              className="w-full py-4 rounded-2xl bg-violet-600 text-white font-semibold text-base hover:bg-violet-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-violet-600/20"
            >
              Continue →
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-6 w-full max-w-sm"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">🎙️</div>
              <h1 className="text-2xl font-bold text-white">
                Choose your companion's voice
              </h1>
              <p className="mt-2 text-white/40 text-sm">
                This is how{" "}
                <span className="text-violet-400">
                  {useAppStore.getState().companionName}
                </span>{" "}
                will sound
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full">
              {VOICE_OPTIONS.map((v) => (
                <motion.button
                  key={v.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleVoiceSelect(v.id)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-200 text-left ${
                    voiceId === v.id
                      ? "bg-violet-600/20 border-violet-500/60 shadow-lg shadow-violet-600/10"
                      : "bg-white/3 border-white/10 hover:bg-white/7 hover:border-white/20"
                  }`}
                >
                  <span className="text-2xl">{v.emoji}</span>
                  <div>
                    <div className="text-white font-medium">{v.name}</div>
                    <div className="text-white/40 text-sm">{v.description}</div>
                  </div>
                  {voiceId === v.id && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-violet-400" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
