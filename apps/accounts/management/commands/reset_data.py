"""
Management command to reset database and create demo users
Usage: python manage.py reset_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.cards.models import Card, CardType
from apps.collections.models import Collection
from apps.agent.models import Conversation, Message
from taggit.models import Tag

User = get_user_model()


class Command(BaseCommand):
    help = 'Clear all data and create demo users'

    def add_arguments(self, parser):
        parser.add_argument(
            '--keep-users',
            action='store_true',
            help='Keep existing users, only clear cards and conversations',
        )

    def handle(self, *args, **options):
        keep_users = options['keep_users']

        self.stdout.write(self.style.WARNING('🗑️  Clearing database...'))

        # Clear cards and related data
        deleted_cards = Card.objects.all().delete()[0]
        self.stdout.write(f'   Deleted {deleted_cards} cards')

        # Clear collections
        deleted_collections = Collection.objects.all().delete()[0]
        self.stdout.write(f'   Deleted {deleted_collections} collections')

        # Clear conversations and messages
        deleted_messages = Message.objects.all().delete()[0]
        deleted_conversations = Conversation.objects.all().delete()[0]
        self.stdout.write(f'   Deleted {deleted_conversations} conversations, {deleted_messages} messages')

        # Clear tags
        deleted_tags = Tag.objects.all().delete()[0]
        self.stdout.write(f'   Deleted {deleted_tags} tags')

        if not keep_users:
            # Clear all users
            deleted_users = User.objects.all().delete()[0]
            self.stdout.write(f'   Deleted {deleted_users} users')
            
            # Create demo users
            self.stdout.write(self.style.WARNING('\n👤 Creating demo users...'))
            
            # Admin user
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@mindvault.com',
                password='admin123',
                first_name='Admin',
                last_name='User'
            )
            self.stdout.write(self.style.SUCCESS(f'   ✓ Admin: admin / admin123'))
            
            # Demo user 1
            demo1 = User.objects.create_user(
                username='demo',
                email='demo@mindvault.com',
                password='demo123',
                first_name='Demo',
                last_name='User'
            )
            self.stdout.write(self.style.SUCCESS(f'   ✓ Demo: demo / demo123'))
            
            # Demo user 2
            demo2 = User.objects.create_user(
                username='test',
                email='test@mindvault.com',
                password='test123',
                first_name='Test',
                last_name='User'
            )
            self.stdout.write(self.style.SUCCESS(f'   ✓ Test: test / test123'))

            # Create sample data for demo user
            self._create_sample_data(demo1)

        self.stdout.write(self.style.SUCCESS('\n✅ Database reset complete!'))

    def _create_sample_data(self, user):
        """Create sample cards and collections for demo user"""
        self.stdout.write(self.style.WARNING('\n📦 Creating sample data for demo user...'))
        
        # Create sample collection
        collection = Collection.objects.create(
            user=user,
            name='Getting Started',
            icon='🚀',
            colour='#3B82F6'
        )
        
        # Create sample cards
        Card.objects.create(
            user=user,
            type=CardType.NOTE,
            title='Welcome to MindVault!',
            body='MindVault helps you capture and organize your digital life.\n\nFeatures:\n- Quick capture URLs, notes, code snippets\n- Voice recordings with transcription\n- Collections to organize your content\n- Full-text search across everything\n- Tag-based organization',
            collection=collection,
            is_pinned=True
        )
        
        Card.objects.create(
            user=user,
            type=CardType.LINK,
            title='MindVault Documentation',
            url='https://github.com/Navaneeth223/mindvault',
            domain='github.com',
            description='Learn more about MindVault on GitHub',
            collection=collection
        )
        
        Card.objects.create(
            user=user,
            type=CardType.NOTE,
            title='Sample Note',
            body='This is a sample note. You can edit or delete it.',
            is_favourite=True
        )
        
        self.stdout.write(self.style.SUCCESS(f'   ✓ Created sample collection and cards'))
