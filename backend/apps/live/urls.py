from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LiveFeedView, LiveSessionViewSet, ScoreEventViewSet

router = DefaultRouter()
router.register("sessions", LiveSessionViewSet, basename="live-session")
router.register("events", ScoreEventViewSet, basename="score-event")

urlpatterns = [
    path("feed/", LiveFeedView.as_view(), name="live-feed"),
    path("", include(router.urls)),
]
