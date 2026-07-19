from rest_framework import serializers

from .models import Table


class TableSerializer(serializers.ModelSerializer):
    game_type_display = serializers.CharField(
        source="get_game_type_display", read_only=True
    )
    display_name = serializers.CharField(read_only=True)

    class Meta:
        model = Table
        fields = (
            "id",
            "game_type",
            "game_type_display",
            "number",
            "name",
            "display_name",
            "hourly_price",
            "is_active",
            "is_available",
            "notes",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_at", "updated_at")
