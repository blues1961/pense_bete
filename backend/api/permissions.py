from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj) -> bool:
        return obj.user_id == request.user.id


IsItemOwner = IsOwner
