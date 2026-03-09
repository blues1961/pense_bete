from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

from api.models import Item


User = get_user_model()


class CurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name")


class ItemSerializer(serializers.ModelSerializer):
    user = CurrentUserSerializer(read_only=True)

    class Meta:
        model = Item
        fields = (
            "id",
            "title",
            "details",
            "kind",
            "status",
            "priority",
            "context",
            "contact_name",
            "due_date",
            "review_at",
            "completed_at",
            "created_at",
            "updated_at",
            "user",
        )
        read_only_fields = ("id", "created_at", "updated_at", "completed_at", "user")

    def validate_title(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Ce champ ne peut pas être vide.")
        return value

    def validate(self, attrs):
        status = attrs.get("status", getattr(self.instance, "status", Item.Status.INBOX))
        completed_at = getattr(self.instance, "completed_at", None)

        if status == Item.Status.DONE and not completed_at:
            attrs["completed_at"] = timezone.now()

        if status != Item.Status.DONE:
            attrs["completed_at"] = None

        return attrs
