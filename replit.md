# Workspace

## Overview

Full-stack AI-powered conversational news companion web app. Users name their AI companion, pick a voice, then can chat with live web data, debate the AI, or watch two AI agents debate each other.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 (main server, port 5000)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Build**: esbuild (CJS bundle for server), Vite (for news-companion frontend)

## Architecture

Everything is served from a single Express server on **port 5000**:
- The news companion React app is pre-built (`artifacts/news-companion/dist/public`) and served as static files
- All API routes (`/api/*`) are handled by the Express server
- The workflow builds the news companion then starts Express

## Features

- **Onboarding**: Name input + voice picker (5 ElevenLabs voices)
- **Chat Mode**: Talk to named AI companion with live Firecrawl web search
- **Debate Me Mode**: AI takes opposing view and debates the user voice-to-voice
- **Watch Debate Mode**: Two AI agents (The Analyst + The Advocate) debate live; user can interrupt; auto-generates verdict via Groq
- **VoiceOrb**: Animated Framer Motion orb with idle/listening/speaking states
- **TranscriptFeed**: Live scrolling conversation log color-coded by role
- **VerdictCard**: Post-debate summary with bullet points + one-line verdict

## Structure

```text
/
├── server/                     # Main Express server (port 5000)
│   ├── index.ts                # Server entry point
│   ├── routes.ts               # All API routes: /api/search, /api/agent-token, /api/verdict
│   ├── static.ts               # Serves artifacts/news-companion/dist/public as static files
│   └── vite.ts                 # Dev mode: serves news-companion static build (no HMR)
├── artifacts/
│   ├── news-companion/         # React + Vite frontend (built to dist/public/)
│   │   └── src/
│   │       ├── store/useAppStore.ts     # Zustand global state
│   │       ├── components/
│   │       │   ├── VoiceOrb.tsx         # Animated orb (idle/listening/speaking)
│   │       │   ├── ModeBar.tsx          # Mode switcher (Chat/Debate Me/Watch Debate)
│   │       │   ├── CompanionScreen.tsx  # Main app wrapper with ElevenLabs sessions
│   │       │   ├── DebateArena.tsx      # Two-agent debate UI
│   │       │   ├── TranscriptFeed.tsx   # Live scrolling conversation
│   │       │   └── VerdictCard.tsx      # Post-debate summary card
│   │       └── pages/
│   │           ├── OnboardingPage.tsx   # Step 1: name, Step 2: voice picker
│   │           └── CompanionPage.tsx    # Main companion screen
│   └── api-server/             # Standalone API server (port 8080, separate artifact)
├── shared/schema.ts            # Drizzle ORM schema + Zod types
└── client/                     # Legacy client shell (unused, news-companion replaces it)
```

## Workflow

The "Start application" workflow runs:
```
PORT=24815 BASE_PATH=/ pnpm --filter @workspace/news-companion run build && npm run dev
```
This builds the news companion to `artifacts/news-companion/dist/public/` then starts the Express server on port 5000.

## Environment Variables Required

All stored in Replit Secrets:
- `FIRECRAWL_API_KEY` — from app.firecrawl.dev (powers /api/search)
- `ELEVENLABS_API_KEY` — from elevenlabs.io/settings
- `COMPANION_AGENT_ID` — companion agent ID from ElevenLabs dashboard
- `ANALYST_AGENT_ID` — analyst agent ID from ElevenLabs dashboard
- `ADVOCATE_AGENT_ID` — advocate agent ID from ElevenLabs dashboard
- `GROK_API_KEY` — Groq API key (powers /api/verdict debate summaries)

## ElevenLabs Agent Setup (Manual)

Create 3 agents in the ElevenLabs dashboard. For each:
1. Set system prompt from `artifacts/news-companion/src/lib/prompts.ts`
2. Add webhook tool `search_web` → POST `{APP_URL}/api/search`, param: `query` (string)
3. Set LLM: GPT-4o or Claude 3.5 Sonnet
4. Voices: Companion = user-selected, Analyst = Adam, Advocate = Rachel

## Styling

- Dark theme only, background: `#0a0a0f`
- Primary accent: violet `#7C3AED`
- Analyst accent: blue `#2563EB`
- Advocate accent: coral/red `#DC2626`
- Font: Inter
