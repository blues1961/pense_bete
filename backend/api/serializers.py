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
    contact = serializers.SerializerMethodField()

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
            "contact",
            "external_contact_id",
            "external_contact_snapshot",
            "due_date",
            "review_at",
            "completed_at",
            "created_at",
            "updated_at",
            "user",
        )
        read_only_fields = ("id", "created_at", "updated_at", "completed_at", "user")

    def get_contact(self, obj):
        if not obj.external_contact_id:
            return None

        snapshot = obj.external_contact_snapshot or {}
        return {
            "id": obj.external_contact_id,
            "visibility": snapshot.get("visibility", ""),
            "name": snapshot.get("name", obj.contact_name),
            "organization": snapshot.get("organization", ""),
            "address": snapshot.get("address", ""),
            "email": snapshot.get("email", ""),
            "phone": snapshot.get("phone", ""),
            "encrypted_payload": snapshot.get("encrypted_payload", ""),
            "encryption_version": snapshot.get("encryption_version", ""),
        }

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


class DashboardItemsQuerySerializer(serializers.Serializer):
    owner_username = serializers.CharField()
