# MindVault — Deployment Guide

## Architecture

```
Vercel (Frontend)  ←→  Render (Backend API)  ←→  Render PostgreSQL
                                ↕
                        Render Redis (optional)
```

---

## Part 1: Deploy Backend to Render

### 1. Create a Render account
Go to https://render.com and sign up (free tier available).

### 2. Create a PostgreSQL database
- Dashboard → New → PostgreSQL
- Name: `mindvault-db`
- Plan: Free
- Copy the **Internal Database URL**

### 3. Create a Redis instance (optional, for Celery)
- Dashboard → New → Redis
- Name: `mindvault-redis`
- Plan: Free
- Copy the **Internal Redis URL**

### 4. Create a Web Service for Django
- Dashboard → New → Web Service
- Connect your GitHub repo
- Settings:
  - **Name**: `mindvault-api`
  - **Root Directory**: `mindvault`
  - **Runtime**: Python 3
  - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
  - **Start Command**: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
  - **Plan**: Free

### 5. Set Environment Variables on Render
```
SECRET_KEY=your-very-secret-key-generate-with-python-secrets
DEBUG=False
ALLOWED_HOSTS=mindvault-api.onrender.com
DATABASE_URL=<your-render-postgres-internal-url>
REDIS_URL=<your-render-redis-internal-url>
CORS_ALLOWED_ORIGINS=https://mindvault.vercel.app
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=30
WHISPER_MODEL=tiny
```

### 6. Create demo user after deploy
In Render Shell:
```bash
python manage.py shell -c "
from apps.accounts.models import User
User.objects.create_superuser('demo', 'demo@mindvault.local', 'demo1234')
"
```

---

## Part 2: Deploy Frontend to Vercel

### 1. Create a Vercel account
Go to https://vercel.com and sign up (free tier).

### 2. Import your GitHub repo
- Dashboard → Add New → Project
- Import your repository
- **Framework Preset**: Vite
- **Root Directory**: `mindvault/frontend`

### 3. Set Environment Variables on Vercel
```
VITE_API_URL=https://mindvault-api.onrender.com
```

### 4. Build Settings
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. Deploy!
Click Deploy. Vercel will build and deploy automatically.

---

## Part 3: Update CORS on Render

After Vercel gives you a URL (e.g., `https://mindvault-xyz.vercel.app`), update the Render environment variable:
```
CORS_ALLOWED_ORIGINS=https://mindvault-xyz.vercel.app,https://mindvault.vercel.app
```

---

## Part 4: Custom Domain (Optional)

### Vercel
- Project Settings → Domains → Add your domain

### Render
- Service Settings → Custom Domains → Add your domain

---

## Free Tier Limitations

| Service | Limitation |
|---------|-----------|
| Render Web Service | Spins down after 15min inactivity (cold start ~30s) |
| Render PostgreSQL | 1GB storage, expires after 90 days |
| Render Redis | 25MB, expires after 30 days |
| Vercel | 100GB bandwidth/month |

### Workaround for cold starts
Add a health check ping every 14 minutes using a free service like UptimeRobot:
- URL: `https://mindvault-api.onrender.com/api/auth/login/`
- Method: GET (will return 405, but keeps server warm)

---

## Alternative: Railway

Railway is simpler than Render and has a better free tier:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy backend
cd mindvault
railway init
railway up

# Set environment variables
railway variables set SECRET_KEY=... DATABASE_URL=... etc.
```

Railway auto-detects Django and sets up PostgreSQL automatically.

---

## Production Checklist

- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY` (generate with `python -c "import secrets; print(secrets.token_urlsafe(50))"`)
- [ ] `ALLOWED_HOSTS` set to your domain
- [ ] `CORS_ALLOWED_ORIGINS` set to your Vercel URL
- [ ] Database migrations run
- [ ] Static files collected
- [ ] Demo user created
- [ ] HTTPS enforced (automatic on Vercel/Render)
- [ ] PWA icons generated (`npm run generate:icons`)

---

## Monitoring

### Render
- Dashboard → Service → Logs (real-time logs)
- Dashboard → Service → Metrics (CPU, memory)

### Vercel
- Dashboard → Project → Analytics
- Dashboard → Project → Functions (serverless logs)

---

## Updating the App

### Backend (Render)
Push to your main branch → Render auto-deploys.

### Frontend (Vercel)
Push to your main branch → Vercel auto-deploys.

---

## Cost Estimate

| Service | Cost |
|---------|------|
| Vercel (Hobby) | Free |
| Render Web Service | Free (with cold starts) |
| Render PostgreSQL | Free (90 days) → $7/month after |
| Render Redis | Free (30 days) → $10/month after |
| **Total** | **Free to start** |

For a production app with no cold starts: ~$17/month on Render.

---

## Quick Deploy Commands

```bash
# Generate PWA icons first
cd mindvault/frontend
npm run generate:icons

# Build frontend
npm run build

# Test production build locally
npm run preview
```

---

**Your app will be live at**: `https://mindvault.vercel.app` 🚀
