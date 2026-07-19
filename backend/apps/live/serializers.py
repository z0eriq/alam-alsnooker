from rest_framework import serializers

from apps.matches.serializers import MatchSerializer

from .models import LiveSession, ScoreEvent


class LiveSessionSerializer(serializers.ModelSerializer):
    match = MatchSerializer(read_only=True)

    class Meta:
        model = LiveSession
        fields = ("id", "match", "is_active", "viewers_count", "last_update", "created_at")


class ScoreEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScoreEvent
        fields = ("id", "match", "score1", "score2", "note", "created_at")
