from django.db.models import Case, IntegerField, Q, Value, When
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action

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

    @action(detail=False, methods=("get",), url_path="today")
    def today(self, request):
        queryset = self._filter_today_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=("get",), url_path="buy")
    def buy(self, request):
        queryset = self._filter_buy_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def _filter_today_queryset(self, queryset):
        now = timezone.now()
        today = now.date()
        open_statuses = (
            Item.Status.INBOX,
            Item.Status.NEXT,
            Item.Status.WAITING,
            Item.Status.SCHEDULED,
        )
        return (
            queryset.filter(status__in=open_statuses)
            .exclude(kind=Item.Kind.BUY)
            .filter(
                Q(due_date__lte=today)
                | Q(review_at__lte=now)
                | Q(priority=Item.Priority.HIGH)
            )
            .annotate(
                priority_rank=Case(
                    When(priority=Item.Priority.HIGH, then=Value(0)),
                    When(priority=Item.Priority.NORMAL, then=Value(1)),
                    default=Value(2),
                    output_field=IntegerField(),
                )
            )
            .order_by(
                "priority_rank",
                "due_date",
                "review_at",
                "title",
                "id",
            )
        )

    def _filter_buy_queryset(self, queryset):
        return queryset.filter(kind=Item.Kind.BUY).exclude(
            status__in=(Item.Status.DONE, Item.Status.ARCHIVED)
        )
