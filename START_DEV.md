# MindVault — Local Development Quick Start

## ✅ Both servers are running:

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5175 |
| **Backend API** | http://localhost:8000 |
| **Django Admin** | http://localhost:8000/admin |

## 🔑 Demo Credentials
- **Username**: `demo`
- **Password**: `demo1234`

---

## Starting the servers

### Backend (Django)
```bash
cd mindvault
python -m django runserver 8000 --settings=config.settings.local
```

### Frontend (React + Vite)
```bash
cd mindvault/frontend
npm run dev
```

---

## What's working right now:
- ✅ Login / Register
- ✅ View all 10 demo cards
- ✅ Card detail drawer (click any card)
- ✅ Quick Capture Modal (click + button)
- ✅ Search (Cmd+K)
- ✅ Collections sidebar
- ✅ Favourites, Archive pages
- ✅ Voice recording (Chrome only)
- ✅ PWA installable

---

## Deployment (Vercel + Render)

See `DEPLOYMENT.md` for full instructions.
