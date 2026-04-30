"""
Seed demo data for MindVault local development
Run: python seed_demo.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from apps.accounts.models import User
from apps.cards.models import Card
from apps.collections.models import Collection

user = User.objects.get(username='demo')

# Create collections
c1, _ = Collection.objects.get_or_create(
    name='Tech', user=user,
    defaults={'colour': '#00f5d4', 'icon': '💻'}
)
c2, _ = Collection.objects.get_or_create(
    name='Reading', user=user,
    defaults={'colour': '#6366f1', 'icon': '📚'}
)
c3, _ = Collection.objects.get_or_create(
    name='Ideas', user=user,
    defaults={'colour': '#f5a623', 'icon': '💡'}
)

# Create sample cards
cards_data = [
    {
        'type': 'link',
        'title': 'Django REST Framework',
        'url': 'https://www.django-rest-framework.org',
        'description': 'Web APIs for Django, made easy.',
        'collection': c1,
    },
    {
        'type': 'note',
        'title': 'Project Ideas',
        'body': '# Ideas\n\n- Build a second brain app\n- Learn Malayalam\n- Deploy to Vercel\n- Read more books',
        'collection': c3,
    },
    {
        'type': 'youtube',
        'title': 'React 18 Deep Dive',
        'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'description': 'Everything about React 18 concurrent features',
        'collection': c1,
    },
    {
        'type': 'github',
        'title': 'facebook/react',
        'url': 'https://github.com/facebook/react',
        'description': 'The library for web and native user interfaces',
        'collection': c1,
    },
    {
        'type': 'code',
        'title': 'JWT Auth Snippet',
        'body': 'const token = localStorage.getItem("access_token")\nconst headers = { Authorization: `Bearer ${token}` }\n\nconst response = await fetch("/api/cards/", { headers })',
        'collection': c1,
        'metadata': {'language': 'javascript'},
    },
    {
        'type': 'note',
        'title': 'Malayalam Learning Notes',
        'body': '# Malayalam Basics\n\nHello = ഹലോ\nThank you = നന്ദി\nGood morning = സുപ്രഭാതം\nHow are you = സുഖമാണോ',
        'is_favourite': True,
    },
    {
        'type': 'link',
        'title': 'Framer Motion',
        'url': 'https://www.framer.com/motion/',
        'description': 'Production-ready motion library for React',
        'collection': c1,
    },
    {
        'type': 'note',
        'title': 'Book Notes: Deep Work',
        'body': '# Deep Work by Cal Newport\n\n## Key Ideas\n\n- Focus is the new IQ\n- Schedule deep work blocks\n- Quit social media\n- Embrace boredom\n\n## My Takeaways\n\nI need to block 2 hours every morning for deep work.',
        'collection': c2,
        'is_favourite': True,
    },
    {
        'type': 'link',
        'title': 'TailwindCSS Documentation',
        'url': 'https://tailwindcss.com/docs',
        'description': 'Rapidly build modern websites without ever leaving your HTML.',
        'collection': c1,
    },
    {
        'type': 'note',
        'title': 'Weekly Review Template',
        'body': '# Weekly Review\n\n## What went well?\n\n## What could be better?\n\n## Goals for next week\n\n1. \n2. \n3. ',
        'collection': c3,
    },
]

created = 0
for data in cards_data:
    if not Card.objects.filter(user=user, title=data['title']).exists():
        Card.objects.create(user=user, **data)
        created += 1

print(f'✅ Created {created} new cards')
print(f'📦 Total cards: {Card.objects.filter(user=user).count()}')
print(f'📁 Total collections: {Collection.objects.filter(user=user).count()}')
print('\n🚀 Demo data ready!')
print('   Login: demo / demo1234')
print('   URL: http://localhost:5175')
