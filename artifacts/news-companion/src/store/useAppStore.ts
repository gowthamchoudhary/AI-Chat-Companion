import { create } from "zustand";

export interface CardData {
  title: string;
  description: string;
  url: string;
  image: string | null;
  source: string;
  publishedDate: string | null;
}

export interface Message {
  role: "user" | "companion" | "analyst" | "advocate";
  text: string;
  timestamp: number;
  sources?: string[];
}

export type AppMode = "chat" | "debate-me" | "watch-debate";
export type ActiveAgent = "companion" | "analyst" | "advocate";

interface AppState {
  companionName: string;
  voiceId: string;
  mode: AppMode;
  isListening: boolean;
  isSpeaking: boolean;
  isSearching: boolean;
  activeAgent: ActiveAgent;
  transcript: Message[];
  currentTopic: string;
  currentQuery: string;
  isDebateActive: boolean;
  newsCards: CardData[];
  conversationStarted: boolean;

  setCompanionName: (name: string) => void;
  setVoiceId: (id: string) => void;
  setMode: (mode: AppMode) => void;
  setIsListening: (v: boolean) => void;
  setIsSpeaking: (v: boolean) => void;
  setIsSearching: (v: boolean) => void;
  setActiveAgent: (agent: ActiveAgent) => void;
  addMessage: (msg: Message) => void;
  setTranscript: (msgs: Message[]) => void;
  setCurrentTopic: (topic: string) => void;
  setCurrentQuery: (q: string) => void;
  setIsDebateActive: (v: boolean) => void;
  setNewsCards: (cards: CardData[]) => void;
  setConversationStarted: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  companionName: "",
  voiceId: "21m00Tcm4TlvDq8ikWAM",
  mode: "chat",
  isListening: false,
  isSpeaking: false,
  isSearching: false,
  activeAgent: "companion",
  transcript: [],
  currentTopic: "",
  currentQuery: "",
  isDebateActive: false,
  newsCards: [],
  conversationStarted: false,

  setCompanionName: (name) => set({ companionName: name }),
  setVoiceId: (id) => set({ voiceId: id }),
  setMode: (mode) => set({ mode }),
  setIsListening: (isListening) => set({ isListening }),
  setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setActiveAgent: (activeAgent) => set({ activeAgent }),
  addMessage: (msg) =>
    set((state) => ({ transcript: [...state.transcript, msg] })),
  setTranscript: (transcript) => set({ transcript }),
  setCurrentTopic: (currentTopic) => set({ currentTopic }),
  setCurrentQuery: (currentQuery) => set({ currentQuery }),
  setIsDebateActive: (isDebateActive) => set({ isDebateActive }),
  setNewsCards: (newsCards) => set({ newsCards }),
  setConversationStarted: (conversationStarted) => set({ conversationStarted }),
}));
