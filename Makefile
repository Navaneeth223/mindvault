# ─── MindVault Makefile ────────────────────────────────────────────────────────
# Usage: make <target>
# Requires: docker, docker-compose

.PHONY: dev build stop migrate seed shell test lint format logs clean help

# Start all services in development mode (with live logs)
dev:
	docker-compose up

# Start all services in detached (background) mode
up:
	docker-compose up -d

# Build all Docker images
build:
	docker-compose build

# Stop all running services
stop:
	docker-compose down

# Stop and remove volumes (WARNING: destroys database data)
clean:
	docker-compose down -v --remove-orphans

# Run Django database migrations
migrate:
	docker-compose exec backend python manage.py migrate

# Create new Django migrations from model changes
makemigrations:
	docker-compose exec backend python manage.py makemigrations

# Seed the database with demo data
seed:
	docker-compose exec backend python manage.py seed_demo_data

# Open Django shell (with shell_plus for auto-imports)
shell:
	docker-compose exec backend python manage.py shell_plus

# Run backend tests with pytest
test:
	docker-compose exec backend pytest apps/ -v --tb=short

# Run frontend ESLint
lint:
	cd frontend && npx eslint src --ext .ts,.tsx --max-warnings 0

# Format frontend code with Prettier
format:
	cd frontend && npx prettier --write src/

# Tail logs from all services
logs:
	docker-compose logs -f

# Tail logs from a specific service: make logs-backend
logs-backend:
	docker-compose logs -f backend

logs-celery:
	docker-compose logs -f celery

logs-frontend:
	docker-compose logs -f frontend

# Collect Django static files
collectstatic:
	docker-compose exec backend python manage.py collectstatic --noinput

# Create a Django superuser
superuser:
	docker-compose exec backend python manage.py createsuperuser

# Open psql shell in the database container
db-shell:
	docker-compose exec db psql -U mindvault -d mindvault

# Print help
help:
	@echo ""
	@echo "  MindVault — Available Make Targets"
	@echo "  ─────────────────────────────────────────────"
	@echo "  make dev            Start all services (foreground)"
	@echo "  make up             Start all services (background)"
	@echo "  make build          Build Docker images"
	@echo "  make stop           Stop all services"
	@echo "  make clean          Stop + remove volumes (destructive!)"
	@echo "  make migrate        Run Django migrations"
	@echo "  make makemigrations Create new migrations"
	@echo "  make seed           Seed demo data"
	@echo "  make shell          Django shell_plus"
	@echo "  make test           Run pytest"
	@echo "  make lint           ESLint frontend"
	@echo "  make logs           Tail all logs"
	@echo "  make superuser      Create Django superuser"
	@echo ""

# ─── Local Docker (no cloud, instant startup) ─────────────────────────────────

# Quick start — runs everything locally (backend + frontend + redis)
start:
	@echo "🚀 Starting MindVault locally..."
	@cd frontend && npm run build 2>/dev/null || echo "⚠️  Frontend not built yet, run: make build-frontend"
	docker-compose -f docker-compose.local.yml up -d
	@echo ""
	@echo "✅ MindVault is running!"
	@echo "   Backend:  http://localhost:8000"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Health:   http://localhost:8000/api/health/"
	@echo ""
	@make local-ip

# Start with live logs
local:
	docker-compose -f docker-compose.local.yml up

# Start and rebuild images
local-build:
	docker-compose -f docker-compose.local.yml up --build

# Stop local services
local-down:
	docker-compose -f docker-compose.local.yml down

# Show your local IP address (for mobile app connection)
local-ip:
	@echo "📱 Your local IP address (enter this in mobile app Settings):"
	@hostname -I 2>/dev/null | awk '{print "   http://" $$1 ":8000"}' || \
	 ipconfig getifaddr en0 2>/dev/null | awk '{print "   http://" $$1 ":8000"}' || \
	 echo "   Run 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux) to find your IP"

# Tail local backend logs
local-logs:
	docker-compose -f docker-compose.local.yml logs -f backend

# Build frontend for local serving
build-frontend:
	@echo "🔨 Building frontend..."
	cd frontend && npm install && npm run build
	@echo "✅ Frontend built → frontend/dist/"

# Create demo user in local Docker
local-seed:
	docker-compose -f docker-compose.local.yml exec backend python manage.py shell -c "\
from apps.accounts.models import User; \
User.objects.filter(username='demo').exists() or \
User.objects.create_superuser('demo', 'demo@mindvault.local', 'demo1234'); \
print('Demo user: demo / demo1234')"

# Open Django shell in local Docker
local-shell:
	docker-compose -f docker-compose.local.yml exec backend python manage.py shell
