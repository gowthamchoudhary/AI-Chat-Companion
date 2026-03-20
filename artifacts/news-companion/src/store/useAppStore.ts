import { create } from "zustand";

export interface Message {
  role: "user" | "companion" | "analyst" | "advocate";
  text: string;
  timestamp: number;
}

export type AppMode = "chat" | "debate-me" | "watch-debate";
export type ActiveAgent = "companion" | "analyst" | "advocate";

interface AppState {
  companionName: string;
  voiceId: string;
  mode: AppMode;
  isListening: boolean;
  isSpeaking: boolean;
  activeAgent: ActiveAgent;
  transcript: Message[];
  currentTopic: string;
  isDebateActive: boolean;

  setCompanionName: (name: string) => void;
  setVoiceId: (id: string) => void;
  setMode: (mode: AppMode) => void;
  setIsListening: (v: boolean) => void;
  setIsSpeaking: (v: boolean) => void;
  setActiveAgent: (agent: ActiveAgent) => void;
  addMessage: (msg: Message) => void;
  setTranscript: (msgs: Message[]) => void;
  setCurrentTopic: (topic: string) => void;
  setIsDebateActive: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  companionName: "",
  voiceId: "21m00Tcm4TlvDq8ikWAM",
  mode: "chat",
  isListening: false,
  isSpeaking: false,
  activeAgent: "companion",
  transcript: [],
  currentTopic: "",
  isDebateActive: false,

  setCompanionName: (name) => set({ companionName: name }),
  setVoiceId: (id) => set({ voiceId: id }),
  setMode: (mode) => set({ mode }),
  setIsListening: (isListening) => set({ isListening }),
  setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
  setActiveAgent: (activeAgent) => set({ activeAgent }),
  addMessage: (msg) =>
    set((state) => ({ transcript: [...state.transcript, msg] })),
  setTranscript: (transcript) => set({ transcript }),
  setCurrentTopic: (currentTopic) => set({ currentTopic }),
  setIsDebateActive: (isDebateActive) => set({ isDebateActive }),
}));
