from django.urls import re_path

from .consumers import BookingConsumer, LiveMatchConsumer

websocket_urlpatterns = [
    re_path(r"ws/live/$", LiveMatchConsumer.as_asgi()),
    re_path(r"ws/bookings/$", BookingConsumer.as_asgi()),
]
