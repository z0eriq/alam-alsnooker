from django.db import models

from apps.matches.models import Match


class LiveSession(models.Model):
    """Active live broadcast session for a match."""

    match = models.OneToOneField(
        Match,
        on_delete=models.CASCADE,
        related_name="live_session",
    )
    is_active = models.BooleanField(default=True)
    viewers_count = models.PositiveIntegerField(default=0)
    last_update = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "جلسة مباشرة"
        verbose_name_plural = "الجلسات المباشرة"

    def __str__(self):
        return f"LIVE — {self.match}"


class ScoreEvent(models.Model):
    """Audit trail of score changes for live matches."""

    match = models.ForeignKey(
        Match,
        on_delete=models.CASCADE,
        related_name="score_events",
    )
    score1 = models.PositiveIntegerField()
    score2 = models.PositiveIntegerField()
    note = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.match_id}: {self.score1}-{self.score2}"
