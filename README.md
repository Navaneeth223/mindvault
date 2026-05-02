# MindVault

**Everything you've ever found worth keeping.**

MindVault is a personal second brain — a private, self-hosted knowledge vault where you capture, organise, and rediscover everything: YouTube videos, GitHub repos, bookmarks, voice notes (Malayalam + English), code snippets, PDFs, and more. With ARIA, your personal AI agent, it gets smarter the more you use it.

---

## ✨ Features

### Capture (Zero Friction)
- **Quick Capture Modal** — Cmd+Shift+A or floating + button
- **URL/Link** — Auto-scrape title, description, OG image, favicon
- **YouTube** — Extract title, channel, thumbnail, duration
- **GitHub** — Extract repo name, stars, language, README preview
- **Markdown Notes** — Rich editor with live preview
- **Voice Notes** — Record audio, real-time waveform, transcribe (Malayalam + English)
- **Code Snippets** — Syntax highlighting, language detection
- **Images/PDFs** — Drag-and-drop upload, auto-thumbnail
- **Chat Excerpts** — Save conversations from WhatsApp, Telegram, etc.
- **Music** — YouTube music library with global player

### ARIA — Personal AI Agent
- **Semantic Search** — Finds cards by meaning, not just keywords
- **Persistent Memory** — Remembers your goals, skills, context across conversations
- **Tool Use** — Saves cards, sets reminders, searches web, creates notes
- **Malayalam Support** — Responds in Malayalam if configured
- **Local-First** — Ollama = zero cost, zero privacy risk
- **Daily Briefing** — Personalised morning summary

### Organisation
- **Collections** — Named folders with colour coding
- **Smart Collections** — Saved filters that auto-populate
- **Tags** — Free-form, multi-tag, autocomplete
- **Favourites** — Single-click to star
- **Archive** — Soft-delete without permanent removal
- **Reminders** — Date + time picker on any card

### Views & Search
- **Grid View** — Masonry card layout
- **List View** — Compact rows
- **Global Search** — Cmd+K, searches title, description, transcript, body
- **Filter** — By type, tag, collection, date range

### Focus Timer
- **Pomodoro** — 25/50 min focus sessions
- **Session Logging** — Track daily focus time
- **Streak Counter** — Consecutive days with focus sessions
- **Ambient Sound** — Rain, café sounds

### PWA / Offline
- **Installable** — Add to Home Screen on iOS, Android, desktop
- **Offline Mode** — Cached cards viewable without internet
- **Background Sync** — Captures queued and synced when back online

### Browser Extension
- **Save current page** — One click or Ctrl+Shift+S
- **Context menu** — Right-click any link or selection
- **Auto-detect type** — YouTube, GitHub, links

---

## 🛠️ Tech Stack

### Backend
- Python 3.11 + Django 5.x + Django REST Framework
- PostgreSQL (production) / SQLite (dev)
- Celery + Redis for async tasks
- Django Channels for WebSocket
- Whisper for speech-to-text
- ChromaDB for vector search (ARIA)
- JWT authentication

### Frontend
- React 18 + TypeScript + Vite
- TailwindCSS (custom dark theme)
- Zustand + React Query
- Framer Motion animations
- Workbox PWA

### AI (ARIA)
- Ollama (free, local) — llama3.2, mistral, phi3.5
- OpenAI (GPT-4o-mini)
- Anthropic Claude (claude-3-5-haiku)
- Google Gemini (gemini-1.5-flash)

### DevOps
- Docker + docker-compose
- Nginx reverse proxy
- Render (cloud deployment)
- Vercel (frontend deployment)

---

## 🚀 Quick Start

### Prerequisites
- Docker + docker-compose
- Git

### Installation

```bash
git clone <your-repo-url> mindvault
cd mindvault

# Copy environment variables
cp .env.example .env

# Build and start
make build
make up
make migrate
make seed

# Open in browser
open http://localhost:5173
```

### Demo Credentials
- **Username**: `demo`
- **Password**: `demo1234`

### ARIA Setup (Optional — Free Local AI)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model (choose based on RAM)
ollama pull llama3.2      # 2GB RAM — start here
ollama pull mistral       # 5GB RAM — better quality

# Index your vault
make aria-index

# Go to ARIA tab and start chatting
```

---

## 📋 Make Commands

```bash
make dev            # Start all services (foreground)
make up             # Start all services (background)
make build          # Build Docker images
make stop           # Stop all services
make clean          # Stop + remove volumes (destructive!)
make migrate        # Run Django migrations
make seed           # Seed demo data
make shell          # Django shell_plus
make test           # Run pytest
make lint           # ESLint frontend
make logs           # Tail all logs
make aria-index     # Index vault into ChromaDB
make aria-status    # Check Ollama connection
```

---

## 📡 API Reference

### Authentication
```
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/token/refresh/
POST /api/auth/logout/
GET  /api/auth/me/
```

### Cards
```
GET    /api/cards/                  List (paginated, filtered)
POST   /api/cards/                  Create
GET    /api/cards/{id}/             Retrieve
PATCH  /api/cards/{id}/             Update
DELETE /api/cards/{id}/             Soft delete (archive)
POST   /api/cards/{id}/favourite/   Toggle favourite
POST   /api/cards/{id}/archive/     Toggle archive
POST   /api/cards/{id}/pin/         Toggle pin
GET    /api/cards/random/           Random undiscovered card
```

### ARIA Agent
```
POST   /api/agent/chat/             Main chat endpoint
GET    /api/agent/conversations/    List conversations
GET    /api/agent/memory/           Personal facts
PATCH  /api/agent/memory/           Edit/delete fact
POST   /api/agent/memory/add/       Add fact manually
GET    /api/agent/settings/         Agent settings
PATCH  /api/agent/settings/         Update settings
POST   /api/agent/reindex/          Reindex vault
GET    /api/agent/status/           LLM connection status
```

### Other
```
GET    /api/collections/
GET    /api/search/?q=
GET    /api/reminders/
GET    /api/timer/sessions/
POST   /api/meta/scrape/
POST   /api/upload/
GET    /api/export/
GET    /api/health/
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background | `#0f0f1a` |
| Surface | `#1a1a2e` |
| Accent | `#00f5d4` (electric cyan) |
| Secondary | `#f5a623` (warm amber — voice/audio) |
| Heading font | Instrument Serif |
| Body font | DM Sans |
| Code font | JetBrains Mono |

---

## 🔌 Browser Extension

Load from `extension/` folder in Chrome:
1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` folder

---

## 📱 Mobile App

React Native app in `mindvault-mobile/`:
```bash
cd mindvault-mobile
npm install
npx expo start
```

## 🖥️ Desktop App

Electron app in `mindvault-desktop/`:
```bash
cd mindvault-desktop
npm install
npm run dev
```

---

## 🚢 Deployment

### Backend → Render (Free)
1. Push to GitHub
2. Create new Web Service on Render
3. Connect repo, set `DJANGO_SETTINGS_MODULE=config.settings.production`
4. Add environment variables from `.env.example`

### Frontend → Vercel (Free)
1. Import repo on Vercel
2. Set root directory to `frontend`
3. Set `VITE_API_URL` to your Render URL

See `DEPLOYMENT.md` for detailed instructions.

---

## 🧪 Testing

```bash
# Backend
make test

# Frontend
cd frontend && npm run lint
```

---

## 📁 Project Structure

```
mindvault/
├── apps/
│   ├── accounts/      Auth & user management
│   ├── cards/         Core card CRUD + async tasks
│   ├── collections/   Collections
│   ├── reminders/     Reminders
│   ├── search/        Full-text search
│   ├── timer/         Focus timer sessions
│   └── agent/         ARIA AI agent
├── config/            Django settings (base, local, dev, prod)
├── extension/         Chrome browser extension
├── frontend/          React + TypeScript SPA
├── mindvault-mobile/  React Native mobile app
├── mindvault-desktop/ Electron desktop app
├── nginx/             Nginx config
└── docs/              Documentation
```

---

## 🌟 What Makes This Special

1. **Local-first AI** — Ollama means zero API cost, zero privacy risk
2. **Malayalam voice** — Rare in web apps, works in Chrome
3. **Semantic search** — Finds cards by meaning, not keywords
4. **Persistent memory** — ARIA remembers your goals across conversations
5. **Full-stack PWA** — Works offline, installable on all platforms
6. **Production-ready** — Docker, migrations, tests, deployment configs

---

## 📝 License

MIT License — free to use, modify, and deploy.

---

**Built with ❤️ in Kerala, India**

*MindVault — Everything you've ever found worth keeping.*
