from django.urls import include, path
from rest_framework.routers import SimpleRouter

from api.views import DashboardShoppingListView, DashboardTodayItemsView, HealthView, ItemViewSet, WhoAmIView


router = SimpleRouter()
router.register("items", ItemViewSet, basename="item")


urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("auth/whoami/", WhoAmIView.as_view(), name="whoami"),
    path("integrations/dashboard/today-items/", DashboardTodayItemsView.as_view(), name="dashboard-today-items"),
    path(
        "integrations/dashboard/shopping-list/",
        DashboardShoppingListView.as_view(),
        name="dashboard-shopping-list",
    ),
    path("", include(router.urls)),
]
