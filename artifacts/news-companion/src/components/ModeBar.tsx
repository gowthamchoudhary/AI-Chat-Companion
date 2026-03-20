import { useAppStore, AppMode } from "../store/useAppStore";

const modes: { id: AppMode; icon: string; label: string }[] = [
  { id: "chat", icon: "💬", label: "Chat" },
  { id: "debate-me", icon: "⚔️", label: "Debate Me" },
  { id: "watch-debate", icon: "👁️", label: "Watch Debate" },
];

interface ModeBarProps {
  onModeChange?: (mode: AppMode) => void;
}

export function ModeBar({ onModeChange }: ModeBarProps) {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    onModeChange?.(newMode);
  };

  return (
    <div className="flex gap-2 rounded-2xl bg-white/5 border border-white/10 p-1">
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => handleModeChange(m.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            mode === m.id
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
              : "text-white/50 hover:text-white/80 hover:bg-white/5"
          }`}
        >
          <span>{m.icon}</span>
          <span className="hidden sm:inline">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
