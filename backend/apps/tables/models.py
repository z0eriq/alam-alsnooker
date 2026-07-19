from django.db import models


class GameType(models.TextChoices):
    BILLIARDS = "billiards", "بلياردو"
    SNOOKER = "snooker", "سنوكر"
    CARDS = "cards", "ورق"


class Table(models.Model):
    """Physical table at the club."""

    game_type = models.CharField(max_length=20, choices=GameType.choices)
    number = models.PositiveIntegerField()
    name = models.CharField(max_length=100, blank=True)
    hourly_price = models.DecimalField(max_digits=8, decimal_places=2, default=5.00)
    is_active = models.BooleanField(default=True)
    is_available = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["game_type", "number"]
        unique_together = [("game_type", "number")]
        verbose_name = "طاولة"
        verbose_name_plural = "الطاولات"

    def __str__(self):
        label = self.get_game_type_display()
        return self.name or f"{label} — طاولة {self.number}"

    @property
    def display_name(self):
        return str(self)
