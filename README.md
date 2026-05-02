# MindVault

> **Everything you've ever found worth keeping.**

MindVault is a personal second brain — a private, self-hosted knowledge vault where you capture, organise, and rediscover everything: YouTube videos, GitHub repos, bookmarks, voice notes (Malayalam + English), code snippets, PDFs, and more. With ARIA, your personal AI agent, it gets smarter the more you use it.

---

## 📱 Available On Every Platform

| Platform | Status | How to Run |
|----------|--------|------------|
| 🌐 **Web** (React PWA) | ✅ Production | `make up` → `http://localhost:5173` |
| 🖥️ **Desktop** (Electron) | ✅ Working | `cd mindvault-desktop && npm run dev` |
| 📱 **Mobile** (React Native / Expo) | ✅ Working | `cd mindvault-mobile && npm start` |
| 🔌 **Browser Extension** | ✅ Working | Load `extension/` in Chrome |

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
- **Tags** — Free-form, multi-tag, autocomplete
- **Favourites** — Single-click to star
- **Archive** — Soft-delete without permanent removal
- **Reminders** — Date + time picker on any card

### Focus Timer
- **Pomodoro** — 25/50 min focus sessions
- **Session Logging** — Track daily focus time
- **Streak Counter** — Consecutive days with focus sessions

### PWA / Offline
- **Installable** — Add to Home Screen on iOS, Android, desktop
- **Offline Mode** — Cached cards viewable without internet
- **Background Sync** — Captures queued and synced when back online

---

## 🚀 Quick Start

### Web App (Recommended)

```bash
git clone https://github.com/Navaneeth223/mindvault.git
cd mindvault

cp .env.example .env
make build
make up
make migrate
make seed

# Open: http://localhost:5173
```

**Demo login:** `demo` / `demo1234`

---

## 🖥️ Desktop App (Windows / Mac / Linux)

The desktop app wraps the web app in a native Electron window with:
- **System tray** — runs in background
- **Global shortcut** `Ctrl+Shift+Space` — open capture from anywhere
- **Auto-fallback** — loads cloud URL if local server isn't running

### Run Desktop App

```bash
cd mindvault-desktop
npm install
npm run dev
```

A native window opens. If your local backend isn't running, it automatically loads the cloud version at `mindvault-pearl.vercel.app`.

### Build Installer

```bash
# Windows (.exe)
npm run build:win
# → dist/MindVault Setup 1.0.0.exe

# macOS (.dmg)
npm run build:mac

# Linux (.AppImage)
npm run build:linux
```

### Desktop Features
| Feature | Shortcut |
|---------|----------|
| Open capture | `Ctrl+Shift+Space` (global) |
| Search | `Ctrl+K` |
| Switch server | Tray icon → Server |
| Minimize to tray | Close window (doesn't quit) |

---

## 📱 Mobile App (Android / iOS)

Built with React Native + Expo. Runs on your phone via QR code — no build needed.

### Step 1: Install Expo Go on your phone

- **Android**: [Play Store → Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iPhone**: [App Store → Expo Go](https://apps.apple.com/app/expo-go/id982107779)

### Step 2: Start the dev server

```bash
cd mindvault-mobile
npm install
npm start
```

A QR code appears in the terminal.

### Step 3: Scan the QR code

- **Android**: Open Expo Go → Scan QR code
- **iPhone**: Open Camera app → Scan QR code → tap the Expo link

The app opens on your phone instantly.

### Step 4: Connect to your backend

In the app: **Settings → Server URL**

| Option | URL | When to use |
|--------|-----|-------------|
| Cloud | `https://mindvault-62ua.onrender.com` | Works anywhere |
| Local | `http://YOUR_PC_IP:8000` | Same WiFi, faster |

Find your PC's IP:
```bash
# Windows
ipconfig
# Look for "IPv4 Address" under WiFi adapter

# Mac/Linux
ifconfig | grep "inet "
```

### Mobile Screens
- **Home** — Card feed with filters, pull-to-refresh
- **Search** — Full-text search
- **Capture** — Quick add (link, note, code, music, voice)
- **Music** — Music library with player
- **Timer** — Pomodoro focus timer
- **Settings** — Server config, account, sign out

### Build APK (Android)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login (free Expo account)
eas login

# Build APK
cd mindvault-mobile
eas build --platform android --profile preview
```

EAS builds in the cloud (free tier) and gives you a download link for the `.apk` file. Install it directly on your Android phone.

---

## 🔌 Browser Extension

Save any page to MindVault with one click.

### Install

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `extension/` folder

### Usage
- Click the MindVault icon in toolbar → save current page
- Right-click any link → "Save to MindVault"
- Right-click selected text → "Save selection as note"
- Keyboard: `Ctrl+Shift+S` — save current page

### Configure
Click the extension icon → Settings → enter your server URL and login.

---

## ✦ ARIA — Personal AI Agent

ARIA is your personal AI second brain built into MindVault.

### Setup (Free — Ollama)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model (choose based on RAM)
ollama pull llama3.2      # 2GB RAM — start here
ollama pull mistral       # 5GB RAM — better quality

# Index your vault
make aria-index
```

### Supported AI Providers

| Provider | Cost | Privacy | Quality |
|----------|------|---------|---------|
| Ollama (local) | Free | 100% private | Good |
| OpenAI GPT-4o-mini | ~$0.15/1M tokens | Cloud | Excellent |
| Claude Haiku | Cheap | Cloud | Excellent |
| Gemini Flash | Free tier | Cloud | Good |

### Example Prompts

```
"What Django resources have I saved?"
"Remember that I want to become a developer by end of this year"
"Start a 25 minute focus session for studying Django"
"What are my goals?"
"Remind me to practice Django signals tomorrow at 8am"
"Give me a morning briefing"
"Search the web for Django best practices 2024"
```

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

### Web Frontend
- React 18 + TypeScript + Vite
- TailwindCSS (custom dark theme)
- Zustand + React Query
- Framer Motion animations
- Workbox PWA

### Desktop
- Electron 31
- electron-store for settings persistence
- Auto-fallback to cloud URL

### Mobile
- React Native 0.74 + Expo 51
- React Navigation (stack + bottom tabs)
- expo-av for audio playback
- MMKV for fast storage
- FlashList for performant card lists

### AI (ARIA)
- Ollama (free, local) — llama3.2, mistral, phi3.5
- OpenAI (GPT-4o-mini)
- Anthropic Claude (claude-3-5-haiku)
- Google Gemini (gemini-1.5-flash)

---

## 📋 Make Commands

```bash
make dev            # Start all services (foreground)
make up             # Start all services (background)
make build          # Build Docker images
make stop           # Stop all services
make migrate        # Run Django migrations
make seed           # Seed demo data
make shell          # Django shell
make test           # Run pytest
make aria-index     # Index vault into ChromaDB for ARIA
make aria-status    # Check Ollama connection
```

---

## 📡 API Reference

### Authentication
```
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/token/refresh/
GET  /api/auth/me/
```

### Cards
```
GET    /api/cards/                  List (paginated, filtered)
POST   /api/cards/                  Create
PATCH  /api/cards/{id}/             Update
POST   /api/cards/{id}/favourite/   Toggle favourite
POST   /api/cards/{id}/archive/     Toggle archive
GET    /api/cards/random/           Random undiscovered card
```

### ARIA Agent
```
POST   /api/agent/chat/             Main chat
GET    /api/agent/conversations/    List conversations
GET    /api/agent/memory/           Personal facts
PATCH  /api/agent/settings/         Update AI settings
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
GET    /api/health/
```

---

## 📁 Project Structure

```
mindvault/                    ← Git repo root
├── apps/                     ← Django backend apps
│   ├── accounts/             Auth & user management
│   ├── cards/                Core card CRUD + async tasks
│   ├── collections/          Collections
│   ├── reminders/            Reminders
│   ├── search/               Full-text search
│   ├── timer/                Focus timer sessions
│   └── agent/                ARIA AI agent
├── config/                   Django settings (base, local, dev, prod)
├── frontend/                 React + TypeScript web app
├── mindvault-desktop/        Electron desktop app
│   ├── src/main.js           Main process (tray, shortcuts, window)
│   ├── src/preload.js        Context bridge
│   └── package.json
├── mindvault-mobile/         React Native mobile app
│   ├── src/screens/          All screens
│   ├── src/navigation/       Stack + tab navigators
│   ├── src/store/            Zustand stores
│   ├── src/api/              API client
│   └── App.tsx               Entry point
├── extension/                Chrome browser extension
├── nginx/                    Nginx config
├── docs/                     Documentation
└── README.md                 This file
```

---

## 🚢 Deployment

### Backend → Render (Free)
1. Push to GitHub
2. Create Web Service on Render
3. Set `DJANGO_SETTINGS_MODULE=config.settings.production`
4. Add env vars from `.env.example`

### Frontend → Vercel (Free)
1. Import repo on Vercel
2. Root directory: `frontend`
3. Set `VITE_API_URL` to your Render URL

See `DEPLOYMENT.md` for detailed instructions.

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background | `#0f0f1a` (deep space) |
| Surface | `#1a1a2e` |
| Accent | `#00f5d4` (electric cyan) |
| Voice/Audio | `#f5a623` (warm amber) |
| Heading font | Instrument Serif |
| Body font | DM Sans |
| Code font | JetBrains Mono |

---

## 📝 License

MIT License — free to use, modify, and deploy.

---

**Built with ❤️ in Kerala, India**

*MindVault — Everything you've ever found worth keeping.*
