#!/usr/bin/env bash
# Render build script for MindVault Django backend
set -o errexit

echo "==> Installing Python dependencies..."
pip install -r requirements.txt

echo "==> Build complete!"
echo "==> Migrations and static files will be collected in pre-deploy hook"
