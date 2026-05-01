from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='card',
            name='type',
            field=models.CharField(
                choices=[
                    ('link', 'Link'), ('youtube', 'YouTube'), ('github', 'GitHub'),
                    ('note', 'Note'), ('image', 'Image'), ('pdf', 'PDF'),
                    ('voice', 'Voice Note'), ('code', 'Code Snippet'),
                    ('reel', 'Reel / Short'), ('chat', 'Chat Excerpt'),
                    ('file', 'File'), ('music', 'Music'),
                ],
                default='link',
                max_length=20,
            ),
        ),
    ]
