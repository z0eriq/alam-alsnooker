from rest_framework import serializers

from apps.tables.serializers import TableSerializer

from .models import Match


class MatchSerializer(serializers.ModelSerializer):
    table_detail = TableSerializer(source="table", read_only=True)
    display_player1 = serializers.CharField(read_only=True)
    display_player2 = serializers.CharField(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    game_type_display = serializers.CharField(
        source="get_game_type_display", read_only=True
    )
    tournament_name = serializers.CharField(
        source="tournament.name", read_only=True, default=None
    )

    class Meta:
        model = Match
        fields = (
            "id",
            "tournament",
            "tournament_name",
            "game_type",
            "game_type_display",
            "table",
            "table_detail",
            "player1",
            "player2",
            "player1_name",
            "player2_name",
            "display_player1",
            "display_player2",
            "score1",
            "score2",
            "status",
            "status_display",
            "scheduled_at",
            "started_at",
            "ended_at",
            "round_label",
            "winner",
            "winner_name",
            "notes",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_at", "updated_at", "started_at", "ended_at")
