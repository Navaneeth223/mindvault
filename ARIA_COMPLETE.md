# ✦ ARIA — Complete Implementation

ARIA (Adaptive Recall & Intelligence Agent) is MindVault's personal AI second brain.

## What Was Built

### Backend (`apps/agent/`)

| File | Purpose |
|------|---------|
| `models.py` | `Conversation`, `Message`, `PersonalFact`, `AgentSettings` |
| `llm.py` | 4 LLM providers: Ollama (free), OpenAI, Claude, Gemini |
| `memory.py` | ChromaDB semantic search + personal fact extraction |
| `prompts.py` | Personalised system prompt builder |
| `tools.py` | 10 tools ARIA can call |
| `agent.py` | Main agent loop (understand → recall → tools → respond → learn) |
| `tasks.py` | Celery: fact extraction, card indexing, auto-tagging, daily briefing |
| `views.py` | REST API: chat, conversations, memory, settings, reindex, status |
| `signals.py` | Auto-index cards on save/delete |
| `migrations/` | Database schema |
| `tests.py` | Tests for all tools + API endpoints |

### Frontend

| File | Purpose |
|------|---------|
| `api/agent.ts` | Typed API client |
| `store/agentStore.ts` | Zustand: messages, thinking state |
| `MessageBubble.tsx` | User (right) + ARIA (left, no bubble) |
| `ToolCallAccordion.tsx` | Collapsible tool call history |
| `CardsCited.tsx` | Chips linking to referenced vault cards |
| `ConversationSidebar.tsx` | History + memory stats |
| `MemoryPanel.tsx` | View/edit/add personal facts |
| `ARIASettings.tsx` | Provider config, model, API keys, toggles |
| `SuggestedPrompts.tsx` | Quick-tap prompts for empty state |
| `ARIAPage.tsx` | Full chat interface with voice input |

### Integration Points

- **Sidebar**: ARIA nav item with ✦ icon + "AI" badge
- **BottomNav**: ARIA tab (mobile)
- **App.tsx**: `/aria` route
- **Settings**: INSTALLED_APPS includes `apps.timer` + `apps.agent`
- **Celery**: ARIA task routes configured
- **Seed data**: Demo personal facts + AgentSettings created

## API Endpoints

```
POST   /api/agent/chat/                  ← main chat
GET    /api/agent/conversations/         ← list conversations
GET    /api/agent/conversations/{id}/    ← get messages
DELETE /api/agent/conversations/{id}/    ← delete conversation
GET    /api/agent/memory/                ← list personal facts
PATCH  /api/agent/memory/                ← edit/delete fact
POST   /api/agent/memory/add/            ← add fact manually
GET    /api/agent/settings/              ← get settings
PATCH  /api/agent/settings/              ← update settings
POST   /api/agent/reindex/               ← reindex vault
GET    /api/agent/status/                ← LLM connection status
```

## Tools ARIA Can Use

| Tool | What it does |
|------|-------------|
| `search_vault` | Semantic search across all cards |
| `save_card` | Save URL, note, or code to vault |
| `set_reminder` | Natural language reminder ("tomorrow 9am") |
| `web_search` | DuckDuckGo search (no API key) |
| `summarise_url` | Fetch and extract page content |
| `create_note` | Create markdown note in vault |
| `get_vault_stats` | Total cards, types, recent activity |
| `list_reminders` | Upcoming reminders |
| `remember_fact` | Save personal fact about user |
| `start_timer` | Trigger focus timer UI |

## Quick Start

```bash
# 1. Install Ollama (free, local AI)
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2

# 2. Start MindVault
make build && make up && make migrate && make seed

# 3. Go to ARIA tab → Settings → Re-index vault

# 4. Start chatting
```

## Test Prompts

```
"What Django resources have I saved?"
"Remember that I want to become a developer by end of this year"
"Save this: https://docs.djangoproject.com/en/5.0/topics/signals/"
"Remind me to practice Django signals tomorrow at 8am"
"Start a 25 minute focus session for studying Django"
"What are my goals?"
"Give me a morning briefing"
"Search the web for Django best practices 2024"
```

## What Makes ARIA Special

1. **Local-first**: Ollama = zero cost, zero privacy risk, works offline
2. **Semantic search**: finds cards by meaning, not just keywords
3. **Persistent memory**: facts survive across all conversations
4. **Malayalam support**: responds in Malayalam if configured
5. **Tool use**: actually saves cards, sets reminders, searches web
6. **Auto-indexing**: every saved card is instantly searchable
7. **Daily briefing**: personalised morning summary via Celery Beat

## Architecture

```
User message
    ↓
ARIA API (/api/agent/chat/)
    ↓
Agent Core (agent.py)
    ├── Build context: personal facts + semantic search + recent messages
    ├── Build system prompt (personalised with user's data)
    ├── LLM call (Ollama/OpenAI/Claude/Gemini)
    ├── Tool execution loop (up to 4 rounds)
    │   ├── search_vault → ChromaDB
    │   ├── save_card → PostgreSQL
    │   ├── web_search → DuckDuckGo
    │   └── ... (10 tools total)
    ├── Save response to PostgreSQL
    └── Background: extract personal facts (Celery)
```

## Status: ✅ COMPLETE
