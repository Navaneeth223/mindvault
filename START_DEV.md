# MindVault — Local Development Quick Start

## ✅ Services

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8000 |
| **Django Admin** | http://localhost:8000/admin |
| **API Health** | http://localhost:8000/api/health/ |

## 🔑 Demo Credentials
- **Username**: `demo`
- **Password**: `demo1234`

---

## Option 1: Docker (Recommended)

```bash
cd mindvault

# First time setup
make build
make up
make migrate
make seed

# Daily use
make up        # start
make stop      # stop
make logs      # view logs
```

---

## Option 2: Manual (No Docker)

### Backend
```bash
cd mindvault
pip install -r requirements.txt
python manage.py migrate --settings=config.settings.local
python manage.py seed_demo_data --settings=config.settings.local
python manage.py runserver 8000 --settings=config.settings.local
```

### Frontend
```bash
cd mindvault/frontend
npm install
npm run dev
```

---

## ARIA Setup (Optional — Free Local AI)

```bash
# 1. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Pull a model (2GB RAM minimum)
ollama pull llama3.2

# 3. Verify it's running
make aria-status

# 4. Index your vault (after seeding)
make aria-index
```

Then go to **ARIA tab** in the app and start chatting!

---

## What's Working

- ✅ Login / Register
- ✅ All 11 card types (link, youtube, github, note, voice, code, image, pdf, reel, chat, music)
- ✅ Card detail drawer
- ✅ Quick Capture Modal (all types)
- ✅ Search (Cmd+K)
- ✅ Collections sidebar
- ✅ Favourites, Archive, Reminders pages
- ✅ Voice recording + Malayalam speech recognition (Chrome)
- ✅ Focus Timer (Pomodoro)
- ✅ Music Library
- ✅ **ARIA AI Agent** (requires Ollama or API key)
- ✅ PWA installable (Add to Home Screen)
- ✅ Offline mode
- ✅ Browser Extension (load from `extension/` folder)

---

## Deployment

See `DEPLOYMENT.md` for Vercel + Render instructions.
