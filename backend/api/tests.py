from datetime import timedelta
import os
from unittest import mock

from django.contrib.auth import get_user_model
from django.core.management import call_command
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
        past_due = Item.objects.create(
            user=self.user,
            title="Renouveler permis",
            kind=Item.Kind.TASK,
            status=Item.Status.NEXT,
            priority=Item.Priority.NORMAL,
            due_date=today - timedelta(days=3),
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
            [high_priority.id, past_due.id, due_today.id, review_due.id],
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

    def test_item_can_reference_external_contact_snapshot(self):
        item_response = self.client.post(
            "/api/items/",
            {
                "title": "Prendre rendez-vous changement de pneu",
                "kind": Item.Kind.CALL,
                "status": Item.Status.INBOX,
                "priority": Item.Priority.NORMAL,
                "external_contact_id": "42",
                "external_contact_snapshot": {
                    "id": 42,
                    "visibility": "public",
                    "name": "Garage Tremblay",
                    "address": "123 rue Principale",
                    "phone": "555-0101",
                },
            },
            format="json",
        )

        self.assertEqual(item_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(item_response.data["contact"]["name"], "Garage Tremblay")
        self.assertEqual(item_response.data["contact"]["address"], "123 rue Principale")
        self.assertEqual(item_response.data["contact"]["phone"], "555-0101")

    def test_dashboard_today_items_endpoint_filters_by_owner_username(self):
        now = timezone.now()
        today = now.date()
        keep = Item.objects.create(
            user=self.user,
            title="Appeler banque",
            kind=Item.Kind.CALL,
            status=Item.Status.NEXT,
            priority=Item.Priority.HIGH,
            due_date=today,
        )
        Item.objects.create(
            user=self.other_user,
            title="Autre usager",
            kind=Item.Kind.TASK,
            status=Item.Status.NEXT,
            priority=Item.Priority.HIGH,
            due_date=today,
        )

        with mock.patch.dict(os.environ, {"PENSE_BETE_API_TOKEN": "shared-secret"}, clear=False):
            response = APIClient().get(
                "/api/integrations/dashboard/today-items/",
                {"owner_username": "sylvain"},
                HTTP_X_INTERNAL_API_TOKEN="shared-secret",
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["id"] for item in response.data], [keep.id])

    def test_dashboard_shopping_list_endpoint_rejects_invalid_token(self):
        with mock.patch.dict(os.environ, {"PENSE_BETE_API_TOKEN": "shared-secret"}, clear=False):
            response = APIClient().get(
                "/api/integrations/dashboard/shopping-list/",
                {"owner_username": "sylvain"},
                HTTP_X_INTERNAL_API_TOKEN="wrong-token",
            )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class AdminBootstrapTests(APITestCase):
    def test_ensure_admin_creates_or_updates_admin_user(self):
        with mock.patch.dict(
            os.environ,
            {
                "ADMIN_USERNAME": "admin",
                "ADMIN_EMAIL": "admin@example.com",
                "ADMIN_PASSWORD": "testpass123",
            },
            clear=False,
        ):
            call_command("ensure_admin")

        user = User.objects.get(username="admin")
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
        self.assertEqual(user.email, "admin@example.com")
        self.assertTrue(user.check_password("testpass123"))
