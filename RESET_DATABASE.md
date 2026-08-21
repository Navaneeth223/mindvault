# Reset Database Instructions

## Problem
Render free tier has 512MB memory limit. Your app may crash if database has too much data.

## Solution: Clear Database & Optimize

### Option 1: Reset via Render Shell (Recommended)

1. Go to your Render dashboard
2. Click on your **mindvault-api** service
3. Click **Shell** tab on the left
4. Run this command:
```bash
python manage.py reset_data
```

This will:
- Delete all cards, collections, conversations, tags
- Delete all users
- Create 3 demo accounts:
  - **admin / admin123** (superuser)
  - **demo / demo123** (regular user with sample data)
  - **test / test123** (empty regular user)

### Option 2: Keep Users, Clear Data Only

If you want to keep your existing users but delete their cards/data:
```bash
python manage.py reset_data --keep-users
```

### Option 3: Manual SQL Reset (Advanced)

Connect to your Neon database and run:
```sql
-- Clear all data
TRUNCATE TABLE cards_card CASCADE;
TRUNCATE TABLE collections_collection CASCADE;
TRUNCATE TABLE agent_message CASCADE;
TRUNCATE TABLE agent_conversation CASCADE;
TRUNCATE TABLE taggit_tag CASCADE;
```

## Memory Optimizations Applied

The following optimizations reduce memory usage:

1. **Gunicorn Settings**
   - Reduced from 2 workers to 1 worker with 2 threads
   - Added `--max-requests 100` to restart workers periodically
   - Uses `gthread` worker class (more memory efficient)

2. **Database Connection Pool**
   - Reduced connection timeout from 600s to 300s
   - Limited max connections to 5

3. **API Settings**
   - Reduced page size from 20 to 10 items
   - Lower rate limits (anon: 50/hour, user: 1000/hour)

4. **File Upload Limits**
   - Reduced max file size from 50MB to 10MB

5. **Caching**
   - Added local memory cache with 100 entry limit

## Demo Accounts

After reset, you can login with:

| Username | Password | Type |
|----------|----------|------|
| admin    | admin123 | Superuser (can access /admin) |
| demo     | demo123  | Regular user with sample cards |
| test     | test123  | Empty regular user |

## Tips for Free Tier

1. **Delete old data regularly** - Run reset command monthly
2. **Limit file uploads** - Keep images/PDFs under 5MB
3. **Archive old cards** - Use archive feature instead of keeping everything active
4. **Avoid bulk operations** - Don't import hundreds of cards at once
5. **Monitor memory** - Check Render metrics dashboard

## Need Help?

If memory issues persist:
1. Check Render metrics to see memory usage patterns
2. Consider upgrading to Render's $7/month plan (512MB → 2GB)
3. Or reduce features (disable voice recording, limit file uploads)
