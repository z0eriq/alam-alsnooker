from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PlayerViewSet, TournamentViewSet

router = DefaultRouter()
router.register("players", PlayerViewSet, basename="player")
router.register("", TournamentViewSet, basename="tournament")

urlpatterns = [
    path("", include(router.urls)),
]
