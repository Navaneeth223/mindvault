# MindVault — Your Personal Second Brain

> Everything you've ever found worth keeping.

**MindVault** is a self-hosted, offline-first personal knowledge management system. Capture YouTube videos, GitHub repos, notes, voice recordings (English + Malayalam), code snippets, bookmarks, and more — and make everything searchable, organized, and accessible from any device.

---

## ✨ Features

### Content Types
- **11 card types**: Links, YouTube, GitHub, Notes, Voice, Code, Images, PDFs, Reels, Chat, Files
- **Smart capture**: Auto-detects content type from URLs
- **Rich metadata**: Automatic scraping of titles, descriptions, thumbnails

### Voice & Transcription
- **Malayalam + English support**: Real-time transcription via Web Speech API
- **Fallback to Whisper**: Server-side transcription for unsupported browsers
- **Audio waveform**: Animated visualization during recording

### Offline-First PWA
- **Works without internet**: Full offline functionality
- **Background sync**: Automatic sync when reconnected
- **Installable**: Add to home screen on mobile and desktop
- **Push notifications**: Browser notifications for reminders

### Organization
- **Collections**: Organize cards into collections with colors and icons
- **Tags**: Multi-tag support with autocomplete and color coding
- **Reminders**: Set reminders with quick options or custom dates
- **Search**: Full-text search across titles, descriptions, and transcripts

### Premium UI
- **Linear/Notion-level design**: Professional, polished interface
- **Smooth animations**: Framer Motion throughout
- **Dark theme**: Easy on the eyes
- **Responsive**: Mobile-first design

---

## 🛠 Tech Stack

### Backend
- **Django 5** - Web framework
- **Django REST Framework** - API
- **Celery** - Async task queue
- **Redis** - Message broker & cache
- **PostgreSQL** - Database (SQLite for dev)
- **Whisper** - Speech-to-text
- **Django Channels** - WebSocket support

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **TanStack Query** - Server state
- **Workbox** - PWA & offline

### Infrastructure
- **Docker** - Containerization
- **Nginx** - Reverse proxy
- **IndexedDB** - Offline queue

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mindvault.git
cd mindvault

# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env

# Build and start all services
make build
make dev

# Run database migrations
make migrate

# Load demo data (optional)
make seed
```

Open http://localhost:5173

**Demo credentials**: `demo` / `demo1234`

---

## 📱 Install as App

### Android
1. Open in Chrome
2. Menu → "Add to Home Screen"
3. Confirm installation

### iPhone
1. Open in Safari
2. Share → "Add to Home Screen"
3. Confirm installation

### Desktop
1. Open in Chrome/Edge
2. Click install icon in address bar
3. Confirm installation

---

## 🔌 Browser Extension

The MindVault browser extension allows you to save the current page with one click.

### Installation
1. Open Chrome → Extensions → Developer mode → Load unpacked
2. Select the `/extension` folder
3. Click the MindVault icon
4. Enter your server URL + login

---

## 📡 API Reference

### Authentication
```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "demo",
  "password": "demo1234"
}
```

### Cards
```http
# List cards (paginated, filtered)
GET /api/cards/?page=1&page_size=20&is_favourite=true

# Create card
POST /api/cards/
Content-Type: application/json

{
  "type": "link",
  "url": "https://example.com",
  "title": "Example",
  "tags": ["web", "example"],
  "collection": "uuid"
}

# Get card
GET /api/cards/{id}/

# Update card
PATCH /api/cards/{id}/

# Delete card
DELETE /api/cards/{id}/destroy/
```

### Search
```http
GET /api/search/?q=django
```

### Collections
```http
GET /api/collections/
POST /api/collections/
```

### Metadata Scraping
```http
POST /api/meta/scrape/
Content-Type: application/json

{
  "url": "https://example.com"
}
```

### File Upload
```http
POST /api/upload/
Content-Type: multipart/form-data

file: <binary>
type: "voice"
title: "My voice note"
```

---

## 🌍 Malayalam Support

Voice recording and transcription works in Malayalam (`ml-IN`) using:
- **Web Speech API** (Chrome on Android/Desktop)
- **Fallback: OpenAI Whisper** (server-side, `base` model)

This is a rare feature in open-source projects and makes MindVault accessible to Malayalam speakers.

---

## 📁 Project Structure

```
mindvault/
├── apps/                   # Django apps
│   ├── accounts/           # User authentication
│   ├── cards/              # Card CRUD, upload, export
│   ├── collections/        # Collections management
│   ├── reminders/          # Reminders & notifications
│   └── search/             # Full-text search
├── config/                 # Django settings
│   ├── settings/           # Environment-specific settings
│   ├── celery.py           # Celery configuration
│   └── urls.py             # URL routing
├── frontend/               # React PWA
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   └── utils/          # Utilities
│   ├── public/             # Static assets
│   └── scripts/            # Build scripts
├── extension/              # Chrome extension
├── docker-compose.yml      # Docker services
├── Dockerfile.backend      # Backend container
├── Makefile                # Development commands
└── requirements.txt        # Python dependencies
```

---

## 🏗 Development

### Backend Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver

# Run Celery worker
celery -A config worker -l info
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Generate PWA icons
npm run generate:icons

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 🧪 Testing

### Backend Tests
```bash
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

---

## 🚢 Deployment

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Collect static files
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

### Environment Variables

```env
# Django
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/mindvault

# Redis
REDIS_URL=redis://localhost:6379/0

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0

# Frontend
VITE_API_URL=https://api.yourdomain.com
```

---

## 🤝 Contributing

This is a personal/portfolio project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Django** - Web framework
- **React** - UI library
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **OpenAI Whisper** - Speech-to-text
- **Workbox** - PWA support

---

## 📧 Contact

**Author**: Your Name  
**Email**: your.email@example.com  
**GitHub**: [@yourusername](https://github.com/yourusername)  
**Portfolio**: [yourportfolio.com](https://yourportfolio.com)

---

## 🎯 Why MindVault?

This project was built as a personal learning project while studying Django and React. It represents a genuine tool I use daily — not a tutorial clone.

### Features that make it portfolio-worthy:
- **Malayalam voice recognition** (rare in open-source projects)
- **Offline-first architecture** with background sync
- **Production Docker setup** with Celery + Redis
- **Real-world patterns**: JWT refresh, optimistic UI, React Query cache persistence
- **Premium design**: Linear/Notion-level polish
- **Complete feature set**: 11 card types, collections, tags, reminders, search

---

**Built with ❤️ by a developer who wanted a better way to remember things.**

**Star ⭐ this repo if you find it useful!**
