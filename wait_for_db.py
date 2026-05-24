#!/usr/bin/env python
"""
Wait for database to be available before running migrations.
Useful for Render deployments where DB might not be immediately accessible.
"""
import os
import sys
import time
import psycopg2
from urllib.parse import urlparse

def wait_for_db(max_retries=30, delay=2):
    """
    Wait for PostgreSQL database to become available.
    
    Args:
        max_retries: Maximum number of connection attempts
        delay: Seconds to wait between attempts
    """
    database_url = os.environ.get('DATABASE_URL')
    
    if not database_url:
        print("ERROR: DATABASE_URL environment variable not set")
        sys.exit(1)
    
    # Parse database URL
    parsed = urlparse(database_url)
    
    print(f"Waiting for database at {parsed.hostname}...")
    
    for attempt in range(1, max_retries + 1):
        try:
            # Try to connect
            conn = psycopg2.connect(database_url)
            conn.close()
            print(f"✓ Database is ready! (attempt {attempt}/{max_retries})")
            return True
        except psycopg2.OperationalError as e:
            if attempt == max_retries:
                print(f"✗ Database connection failed after {max_retries} attempts")
                print(f"Error: {e}")
                sys.exit(1)
            
            print(f"⏳ Attempt {attempt}/{max_retries}: Database not ready yet, waiting {delay}s...")
            time.sleep(delay)
    
    return False

if __name__ == "__main__":
    wait_for_db()
