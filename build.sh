#!/usr/bin/env bash
# Render build script for MindVault Django backend
set -o errexit

echo "==> Installing Python dependencies..."
# Use minimal build settings to avoid database connection during pip install
export DJANGO_SETTINGS_MODULE="config.settings.build"
pip install -r requirements.txt

echo "==> Build complete!"
echo "==> Migrations and static files will be collected in pre-deploy hook with production settings"
