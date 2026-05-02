# ARIA Setup Guide

ARIA (Adaptive Recall & Intelligence Agent) is MindVault's personal AI.

## Quick Start (Free — Ollama)

### 1. Install Ollama

**Linux/Mac:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:** Download from https://ollama.com/download/windows

### 2. Pull a Model

Choose based on your PC's RAM:

| Model | RAM | Quality | Speed |
|-------|-----|---------|-------|
| `llama3.2` | 2GB | Good | Fast ← **Start here** |
| `phi3.5` | 3GB | Great | Fast |
| `mistral` | 5GB | Excellent | Medium |
| `llama3.1:8b` | 5GB | Better | Medium |
| `qwen2.5:7b` | 5GB | Great multilingual | Medium |

```bash
ollama pull llama3.2
```

### 3. Configure Docker

Add to your `.env`:
```
OLLAMA_URL=http://host.docker.internal:11434
```

Add to `docker-compose.yml` backend service:
```yaml
backend:
  environment:
    - OLLAMA_URL=http://host.docker.internal:11434
  extra_hosts:
    - "host.docker.internal:host-gateway"  # Linux only
```

### 4. Index Your Vault

After starting MindVault:
1. Go to **ARIA** tab
2. Click **Settings** (gear icon)
3. Click **Re-index vault**

This indexes all your saved cards for semantic search.

### 5. Start Chatting

Try these prompts:
- "What Django resources have I saved?"
- "Remember that I want to become a developer by end of this year"
- "Start a 25 minute focus session for studying"
- "What are my goals?"
- "Give me a morning briefing"

---

## Using Paid APIs

### OpenAI (GPT-4o)

1. Get API key from https://platform.openai.com
2. In ARIA Settings → Provider → OpenAI
3. Enter API key
4. Recommended model: `gpt-4o-mini` (~$0.15/1M tokens)

### Claude (Anthropic)

1. Get API key from https://console.anthropic.com
2. In ARIA Settings → Provider → Claude
3. Enter API key
4. Recommended model: `claude-3-5-haiku-20241022`

### Gemini (Google)

1. Get API key from https://aistudio.google.com
2. In ARIA Settings → Provider → Gemini
3. Enter API key
4. Recommended model: `gemini-1.5-flash`

---

## Features

### Memory System
ARIA automatically extracts personal facts from conversations:
- Goals: "User wants to become a developer"
- Skills: "User knows Django and React"
- Context: "User is from Kerala, India"

View and edit facts in **ARIA → Memory** panel.

### Semantic Search
ARIA searches your vault by meaning, not just keywords.
"What did I save about web frameworks?" finds Django, Flask, FastAPI cards
even if you never used the word "framework".

### Tools ARIA Can Use
- `search_vault` — Find cards by meaning
- `save_card` — Save URLs, notes, code
- `set_reminder` — Natural language reminders
- `web_search` — DuckDuckGo (no API key)
- `summarise_url` — Fetch and summarise pages
- `create_note` — Create structured notes
- `get_vault_stats` — Vault statistics
- `list_reminders` — Upcoming reminders
- `remember_fact` — Save personal facts
- `start_timer` — Start focus timer

### Malayalam Support
Set language to Malayalam in ARIA Settings.
ARIA will respond in Malayalam and understand Malayalam input.
Works best with Ollama's `qwen2.5:7b` or any OpenAI/Claude model.

---

## Troubleshooting

### "Cannot connect to Ollama"
- Ensure Ollama is running: `ollama serve`
- Check URL in settings (Docker: `http://host.docker.internal:11434`)
- Test: `curl http://localhost:11434/api/tags`

### "Model not found"
- Pull the model: `ollama pull llama3.2`
- Check available models: `ollama list`

### "No results from vault search"
- Re-index your vault in ARIA Settings
- Ensure ChromaDB path is writable

### Slow responses
- Use a smaller model (`llama3.2` instead of `llama3.1:8b`)
- Increase Ollama context: set `num_ctx: 2048` in settings
- Use a paid API for faster responses

---

## Privacy

- All memory stays on your server
- Ollama runs 100% locally — no data leaves your machine
- Conversations stored in your PostgreSQL database
- ChromaDB vector store stored locally in `chroma_db/`
- API keys stored in your database (encrypt in production)
