from django.urls import path

from api.views import HealthView, WhoAmIView


urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("auth/whoami/", WhoAmIView.as_view(), name="whoami"),
]
