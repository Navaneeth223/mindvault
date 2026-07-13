# 🧠 MindVault — Your Personal Second Brain

> Capture everything. Find it instantly. Offline-first, self-hosted, AI-powered.

MindVault is a personal knowledge vault that lets you capture and organize **YouTube videos, GitHub repos, notes, voice memos (Malayalam + English), code snippets, music, and more** — then retrieve them through semantic search and an AI assistant.

🌐 **Live demo:** https://mindvault-pearl.vercel.app

---

## ✨ Features

- 🎥 **YouTube capture** — save videos with auto-metadata + transcripts
- 🐙 **GitHub capture** — pin repos/issues with context
- 📝 **Rich notes** — markdown notes with tags & folders
- 🎙️ **Voice notes** — record in Malayalam + English; Whisper transcription
- 🤖 **Multi-LLM AI** — orchestrates OpenAI / Claude / Gemini for Q&A over your vault
- 🔎 **RAG retrieval** — semantic search across all captured content
- 📱 **Cross-platform** — React PWA + React Native + Electron (desktop)
- 🔌 **Offline-first** — works without network; self-hostable

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, TypeScript, Redux, Zustand, PWA |
| Mobile | React Native |
| Desktop | Electron |
| Backend | Django REST Framework, Python |
| AI | OpenAI / Anthropic Claude / Google Gemini, Whisper, LangChain, RAG |
| State | Redux Toolkit, Zustand |

## 📸 Screenshots

> _Add screenshots to `docs/screenshots/` and reference them here:_
> - `docs/screenshots/dashboard.png` — main vault dashboard
> - `docs/screenshots/voice-capture.png` — voice note capture + transcription
> - `docs/screenshots/ai-chat.png` — AI assistant answering over your vault

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/Navaneeth223/mindvault.git
cd mindvault

# Backend
cd server && pip install -r requirements.txt && python manage.py runserver

# Frontend
cd web && npm install && npm run dev
```

See each subfolder's README for details.

## 🤝 Built by

**Navaneeth KV** — Full Stack / MERN developer, AI-assisted.
🌐 Portfolio: https://portfolio-one-bice-26.vercel.app · 💼 linkedin.com/in/navaneeth-kv-270386214

⭐ If MindVault helps you, star the repo!
