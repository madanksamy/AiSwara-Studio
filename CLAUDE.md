# AiSwara Music Studio - Project Guide

## Overview
AiSwara Music Studio is a multi-platform AI music prompt composer that generates style prompts for AI music generators (Suno.ai, HeartMuLa, etc.) with a focus on Indian/Tamil music traditions.

## Tech Stack
- **Monorepo**: Turborepo + pnpm workspaces
- **Web**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: TailwindCSS
- **State**: Zustand with persist middleware
- **Database**: Supabase (PostgreSQL)
- **LLM Providers**: OpenAI (GPT-5.2), Anthropic (Claude Opus 4.5), Google (Gemini 3 Pro), Mistral, Ollama (GLM-4.5)

## Project Structure
```
/Volumes/S/AiSwara-Studio/
├── apps/
│   └── web/               # Next.js 14 web application
│       ├── src/app/       # App Router pages and API routes
│       ├── src/components/# UI components (controls, sections, panels)
│       ├── src/stores/    # Zustand state management
│       └── src/types/     # TypeScript type definitions
├── packages/
│   ├── core/              # Shared business logic
│   │   ├── src/schema/    # Types, validators, defaults
│   │   ├── src/agents/    # Multi-agent pipeline
│   │   └── src/adapters/  # Platform adapters
│   └── llm-clients/       # LLM API wrappers
├── config/
│   └── instruments.json   # 50+ instrument definitions
├── .github/workflows/     # CI/CD pipelines
└── package.json           # Root monorepo config
```

## Key Features
1. **Rich Configuration UI**: 9 sections covering global settings, instruments, vocals, ornamentation, structure, percussion, mix, and macro controls
2. **Multi-Agent Pipeline**: 5 specialized agents (Schema, Style Composer, Platform Adapter, Length Controller, Quality Constraints)
3. **Platform Adapters**: Suno.ai, HeartMuLa, and Generic output formats
4. **Indian Music Focus**: 50+ instruments including Carnatic/Tamil instruments, 25 vocal styles, raga flavors, folk elements

## Development Commands
```bash
pnpm dev          # Start development servers
pnpm build        # Build all packages
pnpm lint         # Run ESLint
pnpm type-check   # TypeScript type checking
pnpm format       # Format with Prettier
```

## LLM Model Assignments
| Agent | LLM | Purpose |
|-------|-----|---------|
| Schema Agent | Mistral Large 3 | Config validation/normalization |
| Style Composer | GPT-5.2 Pro HighThinking | Creative style generation |
| Platform Adapter | Gemini 3 Pro Preview | Platform-specific formatting |
| Length Controller | Gemini 3 Pro Preview | Prompt length adjustment |
| Quality Constraints | Claude Opus 4.5 | Final quality checks |
| Local Fallback | GLM-4.5 (Ollama) | Offline/privacy mode |

## API Keys Required
- `OPENAI_API_KEY` - GPT-5.2 Pro HighThinking
- `ANTHROPIC_API_KEY` - Claude Opus 4.5
- `GOOGLE_AI_API_KEY` - Gemini 3 Pro Preview
- `MISTRAL_API_KEY` - Mistral Large 3
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase instance
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

## Character Limits
- Suno.ai: 120-580 chars
- HeartMuLa: 120-600 chars
- Generic: 100-600 chars
- Hard cap: 600 chars (enforced by Quality Constraints agent)

## Backup Strategy
Per CLAUDE.md global rules:
- Timestamped backups before changes
- Location: `/Volumes/S/Claude-Backups/aiswara-studio-{timestamp}/`

## Next Steps (Future Phases)
1. Implement actual LLM API calls in agents
2. Add Supabase database tables for presets
3. Add YouTube/Spotify analysis endpoints
4. Build desktop Electron wrapper
5. Add curated presets (25-50 Tamil/Carnatic)


---

# API KEYS & INFRASTRUCTURE RESOURCES

## Master Key Source
All API keys and credentials are maintained in:
- **Primary**: `/Users/z/.claude/CLAUDE.md` (loaded automatically by Claude Code)
- **Backup**: `/Users/z/FiDz/keyz/APSI.txt`

DO NOT hardcode keys — reference the master source above.

## Available AI Providers
| Provider | Models | Use For |
|----------|--------|---------|
| Anthropic (Claude) | Opus 4.5, Sonnet | Complex reasoning, code generation |
| OpenAI | GPT series | General AI, embeddings |
| Google Gemini | Gemini models | Multimodal, long context |
| Perplexity | Online models | Web-aware AI queries |
| Moonshot/Kimi | moonshot-v1-128k, kimi-k2.5 | Long context, agent swarm |
| Mistral/DeepSeek | Mistral Large | Code, reasoning |
| ElevenLabs | Voice models | Text-to-speech |
| Deepgram | Speech models | Speech-to-text |
| Hugging Face | Open source models | Custom ML tasks |
| Z.ai | GLM-4.7 | OpenAI-compatible, 200K context |

## Available Infrastructure
| Resource | Purpose | Access |
|----------|---------|--------|
| **AWS (us-east-1)** | Primary cloud — EC2, S3, Route53, Bedrock, SNS, Lambda, Keyspaces | Keys in master source |
| **RunPod** | GPU serverless — model training, inference | API key in master source |
| **Digital Ocean** | Droplets, app hosting | Token in master source |
| **Vercel** | Frontend deployments, Next.js hosting | Token in master source |
| **Supabase** | PostgreSQL, auth, realtime (3 projects) | URLs + keys in master source |
| **Firecrawl** | Web scraping API | Keys in master source |

## Available Services
| Service | Purpose | Access |
|---------|---------|--------|
| **Stripe** | Payment processing (2 live keys) | Keys in master source |
| **Twilio** | SMS/Voice — +18665855241 | SID + Auth in master source |
| **Slack** | Bot + user tokens for workspace automation | Tokens in master source |
| **GitHub** | PAT for repo access | Token in master source |
| **Name.com** | Domain registration API (124 domains) | Credentials in master source |
| **Alpaca** | Stock trading API | Keys in master source |

## DNS — All Domains on AWS Route 53
124 domains managed via Route 53. Registrar is Name.com with NS pointing to AWS.
To add DNS records: use `aws route53 change-resource-record-sets`

## Deployment Servers
| Server | IP | Purpose |
|--------|-----|---------|
| SynthisAI/AzuraCast | 34.219.61.4 | Radio streaming |
| Synthica/AiSwara | 44.240.201.222 | Music creation backend |
| Zilligon | See infrastructure/deploy/ | Microservices platform |

## SSH Keys
- `/Users/z/.ssh/zilligon-dev.pem` (quick access)
- Project-specific keys in each project's infrastructure/ directory

## Global Rules (NON-NEGOTIABLE)
1. **NEVER use `rm`** — move to `/Volumes/S/dumpster/` instead
2. **Save sessions every 30 min** — document progress regularly
3. **Mandatory backups before ANY changes** — timestamped to `/Volumes/S/Claude-Backups/`
4. **Trust user's API choices** — don't argue, just do the job

## Cross-Project Reference
- **Project Guide**: `/Volumes/S/PROJECT_GUIDE.md`
- **All Backups**: `/Volumes/S/Claude-Backups/`
- **Session Maintenance**: `/Volumes/S/scripts/session-maintenance.sh`
