# Port Assignments - VMV Projects

## PERMANENT PORT RULES

Each project gets a dedicated port range. NEVER use ports already assigned.

| Port | Project | Description |
|------|---------|-------------|
| 3000 | RESERVED | Default Next.js - DO NOT USE |
| 3001 | RESERVED | Default Next.js alt - DO NOT USE |
| 3010 | AiSwara Studio | AI Music Prompt Composer |
| 3020 | Synthica | Audio Synthesis Platform |
| 3030 | AIClinica | Medical AI Platform |
| 3040 | (Available) | Next project |
| 3050 | (Available) | Next project |

## Backend/API Ports

| Port | Project | Description |
|------|---------|-------------|
| 4010 | AiSwara API | If separate backend needed |
| 4020 | Synthica API | If separate backend needed |
| 4030 | AIClinica API | If separate backend needed |

## Database/Service Ports

| Port | Service | Description |
|------|---------|-------------|
| 5432 | PostgreSQL | Default |
| 6379 | Redis | Default |
| 11434 | Ollama | Local LLM |

## Rules

1. Check this file BEFORE assigning any port
2. Web apps use 30XX range
3. APIs use 40XX range
4. Increment by 10 for each new project
5. Update this file when adding new projects

---
Last updated: 2026-01-31
