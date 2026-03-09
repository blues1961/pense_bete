from django.conf import settings
from django.db import models


class Item(models.Model):
    class Kind(models.TextChoices):
        TASK = "task", "Task"
        BUY = "buy", "Buy"
        FOLLOWUP = "followup", "Follow-up"
        CALL = "call", "Call"
        QUESTION = "question", "Question"
        IDEA = "idea", "Idea"
        DOCUMENT = "document", "Document"

    class Status(models.TextChoices):
        INBOX = "inbox", "Inbox"
        NEXT = "next", "Next"
        WAITING = "waiting", "Waiting"
        SCHEDULED = "scheduled", "Scheduled"
        DONE = "done", "Done"
        ARCHIVED = "archived", "Archived"

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        NORMAL = "normal", "Normal"
        HIGH = "high", "High"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="items",
    )
    title = models.CharField(max_length=255)
    details = models.TextField(blank=True, default="")
    kind = models.CharField(
        max_length=16,
        choices=Kind.choices,
        default=Kind.TASK,
        db_index=True,
    )
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.INBOX,
        db_index=True,
    )
    priority = models.CharField(
        max_length=16,
        choices=Priority.choices,
        default=Priority.NORMAL,
        db_index=True,
    )
    context = models.CharField(max_length=255, blank=True, default="")
    contact_name = models.CharField(max_length=255, blank=True, default="")
    due_date = models.DateField(null=True, blank=True)
    review_at = models.DateTimeField(null=True, blank=True, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-updated_at", "-created_at", "-id")

    def __str__(self) -> str:
        return self.title
