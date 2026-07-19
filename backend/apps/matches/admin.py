from django.contrib import admin

from .models import Match


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = (
        "display_player1",
        "display_player2",
        "score1",
        "score2",
        "status",
        "table",
        "tournament",
        "scheduled_at",
    )
    list_filter = ("status", "game_type", "tournament")
    search_fields = ("player1_name", "player2_name")
