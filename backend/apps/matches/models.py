from django.db import models

from apps.tables.models import GameType, Table
from apps.tournaments.models import Player, Tournament


class Match(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "مجدول"
        LIVE = "live", "مباشر"
        PAUSED = "paused", "متوقف"
        COMPLETED = "completed", "منتهي"
        CANCELLED = "cancelled", "ملغي"

    tournament = models.ForeignKey(
        Tournament,
        on_delete=models.CASCADE,
        related_name="matches",
        null=True,
        blank=True,
    )
    game_type = models.CharField(max_length=20, choices=GameType.choices)
    table = models.ForeignKey(
        Table,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="matches",
    )
    player1 = models.ForeignKey(
        Player,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="matches_as_p1",
    )
    player2 = models.ForeignKey(
        Player,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="matches_as_p2",
    )
    # Free-play / casual names when not tied to tournament players
    player1_name = models.CharField(max_length=120, blank=True)
    player2_name = models.CharField(max_length=120, blank=True)
    score1 = models.PositiveIntegerField(default=0)
    score2 = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED,
    )
    scheduled_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    round_label = models.CharField(max_length=80, blank=True)
    winner = models.ForeignKey(
        Player,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="match_wins",
    )
    winner_name = models.CharField(max_length=120, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-scheduled_at", "-created_at"]
        verbose_name = "مباراة"
        verbose_name_plural = "المباريات"
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["scheduled_at"]),
        ]

    def __str__(self):
        return f"{self.display_player1} vs {self.display_player2}"

    @property
    def display_player1(self):
        if self.player1:
            return self.player1.name
        return self.player1_name or "لاعب 1"

    @property
    def display_player2(self):
        if self.player2:
            return self.player2.name
        return self.player2_name or "لاعب 2"

    def set_winner_from_scores(self):
        if self.score1 == self.score2:
            return
        if self.score1 > self.score2:
            self.winner = self.player1
            self.winner_name = self.display_player1
        else:
            self.winner = self.player2
            self.winner_name = self.display_player2
