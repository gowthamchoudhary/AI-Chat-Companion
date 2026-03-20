# Workspace

## Overview

Full-stack AI-powered conversational news companion web app. Users name their AI companion, pick a voice, then can chat with live web data, debate the AI, or watch two AI agents debate each other.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Features

- **Onboarding**: Name input + voice picker (5 ElevenLabs voices)
- **Chat Mode**: Talk to named AI companion with live Firecrawl web search
- **Debate Me Mode**: AI takes opposing view and debates the user voice-to-voice
- **Watch Debate Mode**: Two AI agents (The Analyst + The Advocate) debate live; user can interrupt; auto-generates verdict via OpenAI
- **VoiceOrb**: Animated Framer Motion orb with idle/listening/speaking states
- **TranscriptFeed**: Live scrolling conversation log color-coded by role
- **VerdictCard**: Post-debate summary with bullet points + one-line verdict

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/             # Express API server
│   │   └── src/
│   │       ├── routes/
│   │       │   ├── search.ts       # POST /api/search (Firecrawl webhook)
│   │       │   ├── agent-token.ts  # POST /api/agent-token (ElevenLabs signed URL)
│   │       │   └── verdict.ts      # POST /api/verdict (OpenAI debate summary)
│   │       └── lib/
│   │           └── firecrawl.ts    # Firecrawl client
│   └── news-companion/         # React + Vite frontend
│       └── src/
│           ├── store/useAppStore.ts     # Zustand global state
│           ├── lib/
│           │   ├── prompts.ts           # System prompts for all 3 agents
│           │   └── elevenlabs.ts        # ElevenLabs browser session helpers
│           ├── components/
│           │   ├── VoiceOrb.tsx         # Animated orb (idle/listening/speaking)
│           │   ├── ModeBar.tsx          # Mode switcher (Chat/Debate Me/Watch Debate)
│           │   ├── CompanionScreen.tsx  # Main app wrapper with ElevenLabs sessions
│           │   ├── DebateArena.tsx      # Two-agent debate UI
│           │   ├── TranscriptFeed.tsx   # Live scrolling conversation
│           │   └── VerdictCard.tsx      # Post-debate summary card
│           └── pages/
│               ├── OnboardingPage.tsx   # Step 1: name, Step 2: voice picker
│               └── CompanionPage.tsx    # Main companion screen
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
└── scripts/                # Utility scripts
```

## Environment Variables Required

Add these in Secrets:
- `FIRECRAWL_API_KEY` — from app.firecrawl.dev
- `ELEVENLABS_API_KEY` — from elevenlabs.io/settings
- `ELEVENLABS_AGENT_COMPANION_ID` — companion agent ID from ElevenLabs dashboard
- `ELEVENLABS_AGENT_ANALYST_ID` — analyst agent ID from ElevenLabs dashboard
- `ELEVENLABS_AGENT_ADVOCATE_ID` — advocate agent ID from ElevenLabs dashboard
- `OPENAI_API_KEY` — from platform.openai.com

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
