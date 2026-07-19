from rest_framework import serializers

from apps.tables.models import Table
from apps.tables.serializers import TableSerializer

from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    table_detail = TableSerializer(source="table", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    game_type_display = serializers.CharField(
        source="get_game_type_display", read_only=True
    )

    class Meta:
        model = Booking
        fields = (
            "id",
            "game_type",
            "game_type_display",
            "table",
            "table_detail",
            "customer_name",
            "customer_phone",
            "date",
            "start_time",
            "end_time",
            "duration_hours",
            "status",
            "status_display",
            "total_price",
            "notes",
            "admin_notes",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("total_price", "created_at", "updated_at", "admin_notes")

    def validate(self, attrs):
        table = attrs.get("table") or getattr(self.instance, "table", None)
        game_type = attrs.get("game_type") or getattr(self.instance, "game_type", None)
        date = attrs.get("date") or getattr(self.instance, "date", None)
        start = attrs.get("start_time") or getattr(self.instance, "start_time", None)
        end = attrs.get("end_time") or getattr(self.instance, "end_time", None)

        if table and game_type and table.game_type != game_type:
            raise serializers.ValidationError(
                {"table": "الطاولة لا تطابق نوع اللعبة المحدد."}
            )

        if table and date and start and end:
            conflict = Booking.objects.filter(
                table=table,
                date=date,
                status__in=[Booking.Status.PENDING, Booking.Status.CONFIRMED],
            ).exclude(pk=getattr(self.instance, "pk", None))
            conflict = conflict.filter(start_time__lt=end, end_time__gt=start)
            if conflict.exists():
                raise serializers.ValidationError(
                    {"table": "هذه الطاولة محجوزة في الوقت المحدد."}
                )
        return attrs

    def create(self, validated_data):
        booking = Booking(**validated_data)
        if not booking.table and booking.game_type:
            available = (
                Table.objects.filter(
                    game_type=booking.game_type,
                    is_active=True,
                    is_available=True,
                )
                .order_by("number")
                .first()
            )
            booking.table = available
        booking.calculate_price()
        booking.save()
        return booking

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.calculate_price()
        instance.save()
        return instance


class BookingAdminSerializer(BookingSerializer):
    class Meta(BookingSerializer.Meta):
        read_only_fields = ("created_at", "updated_at")
