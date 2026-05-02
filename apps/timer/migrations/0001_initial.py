import uuid
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('cards', '0002_add_music_type'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='TimerSession',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('session_type', models.CharField(
                    choices=[('focus', 'Focus'), ('short_break', 'Short Break'), ('long_break', 'Long Break')],
                    default='focus', max_length=20
                )),
                ('duration', models.IntegerField()),
                ('actual_time', models.IntegerField(default=0)),
                ('completed', models.BooleanField(default=False)),
                ('abandoned', models.BooleanField(default=False)),
                ('note', models.TextField(blank=True)),
                ('started_at', models.DateTimeField()),
                ('ended_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='timer_sessions',
                    to=settings.AUTH_USER_MODEL
                )),
                ('linked_card', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='timer_sessions',
                    to='cards.card'
                )),
            ],
            options={'ordering': ['-started_at']},
        ),
        migrations.AddIndex(
            model_name='timersession',
            index=models.Index(fields=['user', 'started_at'], name='timer_user_started_idx'),
        ),
        migrations.AddIndex(
            model_name='timersession',
            index=models.Index(fields=['user', 'completed'], name='timer_user_completed_idx'),
        ),
    ]
