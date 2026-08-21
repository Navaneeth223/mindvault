#!/bin/bash
# Reset database and create demo users
# Run this on Render shell: bash reset_database.sh

echo "🗑️  Resetting MindVault Database..."
echo ""

python manage.py reset_data

echo ""
echo "✅ Done! You can now login with:"
echo "   Username: demo"
echo "   Password: demo123"
echo ""
echo "   Or use admin account:"
echo "   Username: admin"
echo "   Password: admin123"
