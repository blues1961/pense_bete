from django.contrib import admin

from api.models import Item


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "user", "kind", "status", "priority", "external_contact_id", "updated_at")
    list_filter = ("kind", "status", "priority")
    search_fields = ("title", "details", "context", "contact_name", "external_contact_id", "user__username")
