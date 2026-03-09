from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import Item
from api.permissions import IsItemOwner
from api.serializers import CurrentUserSerializer, ItemSerializer


class HealthView(APIView):
    authentication_classes = ()
    permission_classes = (AllowAny,)

    def get(self, request):
        return Response({"status": "ok", "app": "pb-api"})


class WhoAmIView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        serializer = CurrentUserSerializer(request.user)
        return Response(serializer.data)


class ItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    permission_classes = (IsAuthenticated, IsItemOwner)

    def get_queryset(self):
        queryset = Item.objects.filter(user=self.request.user)

        status = self.request.query_params.get("status")
        kind = self.request.query_params.get("kind")

        if status:
            queryset = queryset.filter(status=status)

        if kind:
            queryset = queryset.filter(kind=kind)

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
