# AiSwara Music Studio
**Path**: `/Volumes/S/AiSwara-Studio/`

## Overview
Multi-platform AI music prompt composer. Generates style prompts for AI music generators (Suno.ai, HeartMuLa, etc.) focused on Indian/Tamil music traditions.

## Tech Stack
- **Monorepo**: Turborepo + pnpm workspaces
- **Web**: Next.js 14 (App Router) + React 18 + TypeScript + TailwindCSS
- **State**: Zustand with persist | **DB**: Supabase (PostgreSQL)
- **LLM Providers**: OpenAI (GPT-5.2), Anthropic (Claude Opus 4.5), Google (Gemini 3 Pro), Mistral Large 3, GLM-4.5 (Ollama local)

## Project Structure
```
apps/web/         - Next.js 14 app (pages, components, stores, types)
packages/
  core/           - Business logic: schema/, agents/, adapters/
  llm-clients/    - LLM API wrappers (anthropic.ts, openai.ts, google.ts, mistral.ts)
config/
  instruments.json - 50+ instrument definitions
```

## Multi-Agent Pipeline
| Agent | LLM | Purpose |
|-------|-----|---------|
| Schema Agent | Mistral Large 3 | Config validation/normalization |
| Style Composer | GPT-5.2 Pro HighThinking | Creative style generation |
| Platform Adapter | Gemini 3 Pro Preview | Platform-specific formatting |
| Length Controller | Gemini 3 Pro Preview | Prompt length adjustment |
| Quality Constraints | Claude Opus 4.5 | Final quality checks |
| Local Fallback | GLM-4.5 (Ollama) | Offline/privacy mode |

## Current State (as of 2026-02-26) — IN PROGRESS
- **`packages/llm-clients/`** BUILT: `anthropic.ts`, `openai.ts`, `google.ts`, `mistral.ts`, `types.ts`, `index.ts` ✅
- **`packages/core/`** ADDED as dependency of `llm-clients` ✅
- **Agents being rewired** (session died mid-work): each agent imports its LLM client, tries LLM first, falls back to rule-based
- **In-progress files at session death**: `schemaAgent.ts` was done, remaining 4 agents (`styleComposerAgent`, `platformAdapterAgent`, `lengthControllerAgent`, `qualityConstraintsAgent`) may be partially wired
- **Resume from**: `/Volumes/S/Claude-Backups/handoffs/2026-02-26_01-52_AiSwara-Studio_auto.md`

## Key Features
- 9-section config UI (global, instruments, vocals, ornamentation, structure, percussion, mix, macro)
- 50+ instruments including Carnatic/Tamil, 25 vocal styles, raga flavors, folk elements
- Platform adapters: Suno.ai (120-580 chars), HeartMuLa (120-600 chars), Generic (100-600 chars)
- Hard cap: 600 chars (enforced by Quality Constraints agent)

## Commands
```bash
pnpm dev         # Start development servers
pnpm build       # Build all packages
pnpm lint        # ESLint
pnpm type-check  # TypeScript
pnpm format      # Prettier
```

## API Keys Needed
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_API_KEY`, `MISTRAL_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- All in `/Users/z/FiDz/keyz/APSI.txt` — grep only, never read whole file

## Next Steps
1. ~~Implement LLM API calls in agents~~ → IN PROGRESS (resume from handoff)
2. Wire remaining 4 agents after Schema Agent
3. Add Supabase DB tables for presets
4. YouTube/Spotify analysis endpoints
5. Desktop Electron wrapper
6. Curated presets (25-50 Tamil/Carnatic)

## Session Health
- Session was 1MB+ when it died — write handoffs proactively at 5MB
- On "Invalid signature in thinking block": `python3 /Volumes/S/scripts/strip-thinking-blocks.py`, new session
