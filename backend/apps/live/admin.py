from django.contrib import admin

from .models import LiveSession, ScoreEvent


@admin.register(LiveSession)
class LiveSessionAdmin(admin.ModelAdmin):
    list_display = ("match", "is_active", "viewers_count", "last_update")
    list_filter = ("is_active",)


@admin.register(ScoreEvent)
class ScoreEventAdmin(admin.ModelAdmin):
    list_display = ("match", "score1", "score2", "created_at")
    list_filter = ("match",)
