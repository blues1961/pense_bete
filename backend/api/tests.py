from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from api.models import Item


User = get_user_model()


class ItemViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="sylvain", password="testpass123")
        self.other_user = User.objects.create_user(username="alice", password="testpass123")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_today_endpoint_returns_open_relevant_items_for_authenticated_user(self):
        now = timezone.now()
        today = now.date()
        due_today = Item.objects.create(
            user=self.user,
            title="Appeler banque",
            kind=Item.Kind.CALL,
            status=Item.Status.NEXT,
            priority=Item.Priority.NORMAL,
            due_date=today,
        )
        review_due = Item.objects.create(
            user=self.user,
            title="Suivi dossier",
            kind=Item.Kind.FOLLOWUP,
            status=Item.Status.WAITING,
            priority=Item.Priority.NORMAL,
            review_at=now - timedelta(hours=1),
        )
        high_priority = Item.objects.create(
            user=self.user,
            title="Urgent mais sans date",
            kind=Item.Kind.TASK,
            status=Item.Status.INBOX,
            priority=Item.Priority.HIGH,
        )
        Item.objects.create(
            user=self.user,
            title="Acheter lait",
            kind=Item.Kind.BUY,
            status=Item.Status.NEXT,
            priority=Item.Priority.NORMAL,
            due_date=today,
        )
        Item.objects.create(
            user=self.user,
            title="Déjà terminé",
            kind=Item.Kind.TASK,
            status=Item.Status.DONE,
            priority=Item.Priority.HIGH,
            due_date=today,
        )
        Item.objects.create(
            user=self.other_user,
            title="Item autre usager",
            kind=Item.Kind.TASK,
            status=Item.Status.NEXT,
            priority=Item.Priority.HIGH,
            due_date=today,
        )

        response = self.client.get("/api/items/today/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [item["id"] for item in response.data],
            [high_priority.id, due_today.id, review_due.id],
        )

    def test_buy_endpoint_returns_open_buy_items_for_authenticated_user(self):
        keep = Item.objects.create(
            user=self.user,
            title="Lait",
            kind=Item.Kind.BUY,
            status=Item.Status.NEXT,
            priority=Item.Priority.NORMAL,
        )
        Item.objects.create(
            user=self.user,
            title="Pain",
            kind=Item.Kind.BUY,
            status=Item.Status.DONE,
            priority=Item.Priority.NORMAL,
        )
        Item.objects.create(
            user=self.user,
            title="Appeler",
            kind=Item.Kind.CALL,
            status=Item.Status.NEXT,
            priority=Item.Priority.NORMAL,
        )
        Item.objects.create(
            user=self.other_user,
            title="Oeufs",
            kind=Item.Kind.BUY,
            status=Item.Status.NEXT,
            priority=Item.Priority.NORMAL,
        )

        response = self.client.get("/api/items/buy/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["id"] for item in response.data], [keep.id])
