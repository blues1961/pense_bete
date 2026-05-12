from django.contrib import admin

from api.models import Item


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "user", "kind", "status", "priority", "updated_at")
    list_filter = ("kind", "status", "priority")
    search_fields = ("title", "details", "context", "contact_name", "user__username")
