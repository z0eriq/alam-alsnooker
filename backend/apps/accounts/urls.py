from django.urls import path

from .views import HealthView, MeView

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("health/", HealthView.as_view(), name="health"),
]
