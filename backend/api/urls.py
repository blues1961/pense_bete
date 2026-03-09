from django.urls import include, path
from rest_framework.routers import SimpleRouter

from api.views import HealthView, ItemViewSet, WhoAmIView


router = SimpleRouter()
router.register("items", ItemViewSet, basename="item")


urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("auth/whoami/", WhoAmIView.as_view(), name="whoami"),
    path("", include(router.urls)),
]
