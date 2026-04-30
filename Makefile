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
