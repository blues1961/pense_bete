from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Item",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("details", models.TextField(blank=True, default="")),
                (
                    "kind",
                    models.CharField(
                        choices=[
                            ("task", "Task"),
                            ("buy", "Buy"),
                            ("followup", "Follow-up"),
                            ("call", "Call"),
                            ("question", "Question"),
                            ("idea", "Idea"),
                            ("document", "Document"),
                        ],
                        db_index=True,
                        default="task",
                        max_length=16,
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("inbox", "Inbox"),
                            ("next", "Next"),
                            ("waiting", "Waiting"),
                            ("scheduled", "Scheduled"),
                            ("done", "Done"),
                            ("archived", "Archived"),
                        ],
                        db_index=True,
                        default="inbox",
                        max_length=16,
                    ),
                ),
                (
                    "priority",
                    models.CharField(
                        choices=[
                            ("low", "Low"),
                            ("normal", "Normal"),
                            ("high", "High"),
                        ],
                        db_index=True,
                        default="normal",
                        max_length=16,
                    ),
                ),
                ("context", models.CharField(blank=True, default="", max_length=255)),
                ("contact_name", models.CharField(blank=True, default="", max_length=255)),
                ("due_date", models.DateField(blank=True, null=True)),
                ("review_at", models.DateTimeField(blank=True, db_index=True, null=True)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="items",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ("-updated_at", "-created_at", "-id"),
            },
        ),
    ]
