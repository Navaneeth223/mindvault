"""
Seed Demo Data Command
─────────────────────────────────────────────────────────────────────────────
Creates a demo user and populates the database with realistic sample data.

Usage: python manage.py seed_demo_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.cards.models import Card, CardType
from apps.collections.models import Collection

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds the database with demo data for MindVault"

    def handle(self, *args, **options):
        self.stdout.write("🌱 Seeding MindVault demo data...")

        # Create demo user
        demo_user, created = User.objects.get_or_create(
            username="demo",
            defaults={
                "email": "demo@mindvault.local",
                "first_name": "Demo",
                "last_name": "User",
                "theme": "dark",
                "accent_colour": "#00f5d4",
                "default_view": "grid",
            },
        )
        
        if created:
            demo_user.set_password("demo1234")
            demo_user.save()
            self.stdout.write(self.style.SUCCESS("✓ Created demo user (demo / demo1234)"))
        else:
            self.stdout.write("→ Demo user already exists")

        # Create collections
        collections_data = [
            {"name": "Django Mastery", "icon": "book", "colour": "#6366f1"},
            {"name": "Kerala Tech Scene", "icon": "map-pin", "colour": "#10b981"},
            {"name": "Money Methods", "icon": "dollar-sign", "colour": "#f5a623"},
            {"name": "Voice Notes", "icon": "mic", "colour": "#8b5cf6"},
            {"name": "Random Reads", "icon": "bookmark", "colour": "#6b7280"},
        ]

        collections = {}
        for idx, coll_data in enumerate(collections_data):
            coll, created = Collection.objects.get_or_create(
                user=demo_user,
                name=coll_data["name"],
                defaults={
                    "icon": coll_data["icon"],
                    "colour": coll_data["colour"],
                    "sort_order": idx,
                },
            )
            collections[coll_data["name"]] = coll
            if created:
                self.stdout.write(f"  ✓ Created collection: {coll_data['name']}")

        # Create demo cards
        cards_data = [
            # YouTube videos
            {
                "type": CardType.YOUTUBE,
                "title": "Django REST Framework Tutorial - Build a Blog API",
                "description": "Learn how to build a production-ready REST API with Django REST Framework",
                "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "collection": collections["Django Mastery"],
                "tags": ["django", "api", "tutorial"],
                "metadata": {
                    "channel": "Tech With Tim",
                    "duration": 3600,
                    "video_id": "dQw4w9WgXcQ",
                },
            },
            {
                "type": CardType.YOUTUBE,
                "title": "Building Real-Time Apps with Django Channels",
                "description": "WebSocket integration with Django for real-time features",
                "url": "https://www.youtube.com/watch?v=example2",
                "collection": collections["Django Mastery"],
                "tags": ["django", "websockets", "real-time"],
                "metadata": {
                    "channel": "CodingEntrepreneurs",
                    "duration": 2400,
                },
            },
            {
                "type": CardType.YOUTUBE,
                "title": "Kerala Startup Ecosystem - 2024 Overview",
                "description": "Deep dive into Kerala's growing tech startup scene",
                "url": "https://www.youtube.com/watch?v=example3",
                "collection": collections["Kerala Tech Scene"],
                "tags": ["kerala", "startups", "tech"],
                "metadata": {
                    "channel": "Kerala Tech News",
                    "duration": 1800,
                },
            },
            
            # GitHub repos
            {
                "type": CardType.GITHUB,
                "title": "django/django",
                "description": "The Web framework for perfectionists with deadlines.",
                "url": "https://github.com/django/django",
                "collection": collections["Django Mastery"],
                "tags": ["django", "python", "framework"],
                "metadata": {
                    "stars": 75000,
                    "language": "Python",
                    "topics": ["web", "framework", "django"],
                },
            },
            {
                "type": CardType.GITHUB,
                "title": "encode/django-rest-framework",
                "description": "Web APIs for Django, made easy.",
                "url": "https://github.com/encode/django-rest-framework",
                "collection": collections["Django Mastery"],
                "tags": ["django", "rest", "api"],
                "metadata": {
                    "stars": 27000,
                    "language": "Python",
                },
            },
            {
                "type": CardType.GITHUB,
                "title": "celery/celery",
                "description": "Distributed Task Queue for Python",
                "url": "https://github.com/celery/celery",
                "collection": collections["Django Mastery"],
                "tags": ["python", "celery", "async"],
                "metadata": {
                    "stars": 23000,
                    "language": "Python",
                },
            },
            
            # Link bookmarks
            {
                "type": CardType.LINK,
                "title": "Django Best Practices 2024",
                "description": "Comprehensive guide to Django project structure, settings, and deployment",
                "url": "https://learndjango.com/tutorials/django-best-practices",
                "collection": collections["Django Mastery"],
                "tags": ["django", "best-practices"],
                "favicon_url": "https://learndjango.com/favicon.ico",
            },
            {
                "type": CardType.LINK,
                "title": "How to Build a Second Brain",
                "description": "Tiago Forte's methodology for personal knowledge management",
                "url": "https://fortelabs.com/blog/basboverview/",
                "collection": collections["Random Reads"],
                "tags": ["productivity", "pkm", "notes"],
            },
            {
                "type": CardType.LINK,
                "title": "Kerala's Tech Talent Pool",
                "description": "Analysis of Kerala's engineering education and tech workforce",
                "url": "https://example.com/kerala-tech-talent",
                "collection": collections["Kerala Tech Scene"],
                "tags": ["kerala", "education", "tech"],
            },
            {
                "type": CardType.LINK,
                "title": "Passive Income Strategies for Developers",
                "description": "Building SaaS products, courses, and digital products",
                "url": "https://example.com/passive-income-dev",
                "collection": collections["Money Methods"],
                "tags": ["money", "saas", "passive-income"],
                "is_favourite": True,
            },
            {
                "type": CardType.LINK,
                "title": "The Pragmatic Programmer - Key Takeaways",
                "description": "Summary of essential lessons from the classic programming book",
                "url": "https://example.com/pragmatic-programmer",
                "collection": collections["Random Reads"],
                "tags": ["books", "programming", "career"],
            },
            
            # Notes
            {
                "type": CardType.NOTE,
                "title": "Django Query Optimization Cheatsheet",
                "body": """# Django Query Optimization

## Use select_related() for ForeignKey
```python
# Bad
for book in Book.objects.all():
    print(book.author.name)  # N+1 queries

# Good
for book in Book.objects.select_related('author'):
    print(book.author.name)  # 1 query
```

## Use prefetch_related() for ManyToMany
```python
books = Book.objects.prefetch_related('tags')
```

## Use only() to limit fields
```python
Book.objects.only('title', 'author')
```

## Use defer() to exclude heavy fields
```python
Book.objects.defer('description', 'content')
```
""",
                "collection": collections["Django Mastery"],
                "tags": ["django", "performance", "database"],
            },
            {
                "type": CardType.NOTE,
                "title": "Kerala Startup Funding Sources",
                "body": """# Funding Options for Kerala Startups

## Government Programs
- **KSUM (Kerala Startup Mission)**: Seed funding up to ₹50L
- **KSIDC**: Industrial loans and equity
- **KITCO**: Technology incubation

## Angel Networks
- Kerala Angel Investors Network (KAIN)
- Indian Angel Network (IAN)
- Mumbai Angels

## Venture Capital
- Unicorn India Ventures
- Axilor Ventures
- Blume Ventures

## Accelerators
- Google for Startups
- Techstars
- Y Combinator (international)
""",
                "collection": collections["Kerala Tech Scene"],
                "tags": ["kerala", "funding", "startups"],
                "is_favourite": True,
            },
            
            # Code snippets
            {
                "type": CardType.CODE,
                "title": "Django Custom User Model Template",
                "body": """from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True)
    bio = models.TextField(max_length=500, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email
""",
                "collection": collections["Django Mastery"],
                "tags": ["django", "python", "auth"],
                "metadata": {"language": "python"},
            },
            {
                "type": CardType.CODE,
                "title": "React useLocalStorage Hook",
                "body": """import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
""",
                "collection": collections["Random Reads"],
                "tags": ["react", "javascript", "hooks"],
                "metadata": {"language": "javascript"},
            },
            
            # Voice note
            {
                "type": CardType.VOICE,
                "title": "Project Ideas Brainstorm",
                "transcript": "Thinking about building a personal CRM for freelancers. "
                             "Key features: client management, project tracking, invoice generation, "
                             "time tracking. Could integrate with Stripe for payments. "
                             "Target market: solo developers and designers in India. "
                             "Pricing: maybe 500 rupees per month.",
                "collection": collections["Voice Notes"],
                "tags": ["ideas", "saas", "crm"],
                "metadata": {"duration": 45, "language": "en"},
            },
            {
                "type": CardType.VOICE,
                "title": "Meeting Notes - Client Call",
                "transcript": "Client wants a custom dashboard for their e-commerce analytics. "
                             "They need real-time sales tracking, inventory alerts, and customer insights. "
                             "Budget is around 2 lakhs. Timeline: 6 weeks. "
                             "Tech stack: React frontend, Django backend, PostgreSQL database.",
                "collection": collections["Voice Notes"],
                "tags": ["client", "project", "notes"],
                "metadata": {"duration": 120, "language": "en"},
            },
        ]

        created_count = 0
        for card_data in cards_data:
            tags = card_data.pop("tags", [])
            
            card, created = Card.objects.get_or_create(
                user=demo_user,
                title=card_data["title"],
                defaults=card_data,
            )
            
            if created:
                card.tags.add(*tags)
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f"✓ Created {created_count} demo cards"))
        self.stdout.write(self.style.SUCCESS("\n🎉 Demo data seeded successfully!"))
        self.stdout.write(self.style.WARNING("\nLogin credentials:"))
        self.stdout.write("  Username: demo")
        self.stdout.write("  Password: demo1234")
