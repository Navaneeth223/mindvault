"""Quick reseed script"""
import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings.local'
import django
django.setup()

from apps.accounts.models import User
from apps.cards.models import Card
from apps.collections.models import Collection

user = User.objects.get(username='demo')

c1, _ = Collection.objects.get_or_create(name='Tech', user=user, defaults={'colour': '#00f5d4', 'icon': 'T'})
c2, _ = Collection.objects.get_or_create(name='Reading', user=user, defaults={'colour': '#6366f1', 'icon': 'R'})
c3, _ = Collection.objects.get_or_create(name='Ideas', user=user, defaults={'colour': '#f5a623', 'icon': 'I'})

cards = [
    {'type': 'link', 'title': 'Django REST Framework', 'url': 'https://www.django-rest-framework.org', 'description': 'Web APIs for Django', 'collection': c1},
    {'type': 'note', 'title': 'Project Ideas', 'body': '# Ideas\n\n- Build a second brain\n- Learn Malayalam\n- Deploy to Vercel', 'collection': c3},
    {'type': 'youtube', 'title': 'React 18 Deep Dive', 'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'collection': c1},
    {'type': 'github', 'title': 'facebook/react', 'url': 'https://github.com/facebook/react', 'description': 'The library for web and native UIs', 'collection': c1},
    {'type': 'code', 'title': 'JWT Auth Snippet', 'body': 'const token = localStorage.getItem("access_token")', 'collection': c1, 'metadata': {'language': 'javascript'}},
    {'type': 'note', 'title': 'Malayalam Notes', 'body': '# Malayalam\n\nHello = Helo\nThank you = Nandi', 'is_favourite': True},
    {'type': 'link', 'title': 'Framer Motion', 'url': 'https://www.framer.com/motion/', 'description': 'Production-ready motion library for React', 'collection': c1},
    {'type': 'note', 'title': 'Book Notes: Deep Work', 'body': '# Deep Work\n\n- Focus is the new IQ\n- Schedule deep work blocks', 'collection': c2, 'is_favourite': True},
    {'type': 'link', 'title': 'TailwindCSS', 'url': 'https://tailwindcss.com/docs', 'description': 'Rapidly build modern websites', 'collection': c1},
    {'type': 'note', 'title': 'Weekly Review', 'body': '# Weekly Review\n\n## What went well?\n\n## Goals for next week', 'collection': c3},
]

created = 0
for d in cards:
    if not Card.objects.filter(user=user, title=d['title']).exists():
        Card.objects.create(user=user, **d)
        created += 1

print(f'Created {created} new cards')
print(f'Total cards: {Card.objects.filter(user=user).count()}')
print(f'Total collections: {Collection.objects.filter(user=user).count()}')
print('Done! Login: demo / demo1234')
