from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django_filters import rest_framework as filters
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.accounts.permissions import IsAdminOrStaff

from .models import Booking
from .serializers import BookingAdminSerializer, BookingSerializer


class BookingFilter(filters.FilterSet):
    date_from = filters.DateFilter(field_name="date", lookup_expr="gte")
    date_to = filters.DateFilter(field_name="date", lookup_expr="lte")

    class Meta:
        model = Booking
        fields = ["date", "game_type", "status", "table", "date_from", "date_to"]


def broadcast_booking(event: str, booking: Booking):
    channel_layer = get_channel_layer()
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            "bookings",
            {
                "type": "booking.update",
                "event": event,
                "booking": BookingSerializer(booking).data,
            },
        )


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.select_related("table").all()
    filterset_class = BookingFilter
    search_fields = ["customer_name", "customer_phone"]
    ordering_fields = ["date", "start_time", "created_at", "status"]

    def get_serializer_class(self):
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return BookingAdminSerializer
        return BookingSerializer

    def get_permissions(self):
        if self.action in ("create", "availability"):
            return [AllowAny()]
        if self.action in ("list", "retrieve"):
            if self.request.user.is_authenticated:
                return [IsAdminOrStaff()]
            return [AllowAny()]
        return [IsAdminOrStaff()]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_authenticated:
            # Public: only own lookup via phone query (optional)
            phone = self.request.query_params.get("phone")
            if phone:
                return qs.filter(customer_phone=phone)
            return qs.none()
        return qs

    def perform_create(self, serializer):
        booking = serializer.save()
        broadcast_booking("created", booking)

    def perform_update(self, serializer):
        booking = serializer.save()
        broadcast_booking("updated", booking)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrStaff])
    def confirm(self, request, pk=None):
        booking = self.get_object()
        booking.status = Booking.Status.CONFIRMED
        booking.save(update_fields=["status", "updated_at"])
        broadcast_booking("confirmed", booking)
        return Response(BookingAdminSerializer(booking).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrStaff])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        booking.status = Booking.Status.CANCELLED
        booking.save(update_fields=["status", "updated_at"])
        broadcast_booking("cancelled", booking)
        return Response(BookingAdminSerializer(booking).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrStaff])
    def complete(self, request, pk=None):
        booking = self.get_object()
        booking.status = Booking.Status.COMPLETED
        booking.save(update_fields=["status", "updated_at"])
        broadcast_booking("completed", booking)
        return Response(BookingAdminSerializer(booking).data)

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def availability(self, request):
        """Return busy slots for a game type / table / date."""
        from apps.tables.models import Table

        game_type = request.query_params.get("game_type")
        date = request.query_params.get("date")
        table_id = request.query_params.get("table")
        if not game_type or not date:
            return Response(
                {"detail": "game_type و date مطلوبان."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        tables = Table.objects.filter(game_type=game_type, is_active=True)
        if table_id:
            tables = tables.filter(pk=table_id)
        busy = Booking.objects.filter(
            date=date,
            game_type=game_type,
            status__in=[Booking.Status.PENDING, Booking.Status.CONFIRMED],
        )
        if table_id:
            busy = busy.filter(table_id=table_id)
        slots = [
            {
                "table_id": b.table_id,
                "start_time": b.start_time,
                "end_time": b.end_time,
                "status": b.status,
            }
            for b in busy
        ]
        return Response(
            {
                "tables": [
                    {"id": t.id, "number": t.number, "name": t.display_name}
                    for t in tables
                ],
                "busy_slots": slots,
            }
        )

    @action(detail=False, methods=["get"], permission_classes=[IsAdminOrStaff])
    def calendar(self, request):
        """Calendar feed: daily / weekly / monthly via date range."""
        qs = self.filter_queryset(self.get_queryset())
        return Response(BookingAdminSerializer(qs, many=True).data)
