from django.contrib import admin

from .models import BracketNode, Player, Tournament


class PlayerInline(admin.TabularInline):
    model = Player
    extra = 1


@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ("name", "game_type", "format", "status", "start_date", "is_published")
    list_filter = ("game_type", "format", "status", "is_published")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [PlayerInline]


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ("name", "tournament", "phone", "ranking", "seed", "is_eliminated")
    list_filter = ("tournament", "is_eliminated")
    search_fields = ("name", "phone")


@admin.register(BracketNode)
class BracketNodeAdmin(admin.ModelAdmin):
    list_display = ("tournament", "round_number", "position", "player1", "player2", "winner")
    list_filter = ("tournament", "round_number")
