from django.db import models

from apps.tables.models import GameType, Table


class Tournament(models.Model):
    class Format(models.TextChoices):
        KNOCKOUT = "knockout", "إقصائي"
        GROUPS = "groups", "مجموعات"
        LEAGUE = "league", "دوري"

    class Status(models.TextChoices):
        UPCOMING = "upcoming", "قادم"
        CURRENT = "current", "جاري"
        PREVIOUS = "previous", "سابق"
        CANCELLED = "cancelled", "ملغي"

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, allow_unicode=True)
    game_type = models.CharField(max_length=20, choices=GameType.choices)
    format = models.CharField(max_length=20, choices=Format.choices, default=Format.KNOCKOUT)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UPCOMING)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    prize_info = models.TextField(blank=True)
    description = models.TextField(blank=True)
    max_participants = models.PositiveIntegerField(default=16)
    entry_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    cover_image = models.ImageField(upload_to="tournaments/", blank=True, null=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_date"]
        verbose_name = "بطولة"
        verbose_name_plural = "البطولات"

    def __str__(self):
        return self.name


class Player(models.Model):
    tournament = models.ForeignKey(
        Tournament,
        on_delete=models.CASCADE,
        related_name="players",
    )
    name = models.CharField(max_length=120)
    phone = models.CharField(max_length=20, blank=True)
    ranking = models.PositiveIntegerField(default=0)
    seed = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)
    is_eliminated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["seed", "ranking", "name"]
        verbose_name = "لاعب"
        verbose_name_plural = "اللاعبون"

    def __str__(self):
        return f"{self.name} ({self.tournament.name})"


class BracketNode(models.Model):
    """Stores knockout bracket structure for a tournament."""

    tournament = models.ForeignKey(
        Tournament,
        on_delete=models.CASCADE,
        related_name="bracket_nodes",
    )
    round_number = models.PositiveIntegerField()
    position = models.PositiveIntegerField()
    player1 = models.ForeignKey(
        Player,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bracket_as_p1",
    )
    player2 = models.ForeignKey(
        Player,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bracket_as_p2",
    )
    winner = models.ForeignKey(
        Player,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bracket_wins",
    )
    match = models.OneToOneField(
        "matches.Match",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bracket_node",
    )

    class Meta:
        ordering = ["round_number", "position"]
        unique_together = [("tournament", "round_number", "position")]

    def __str__(self):
        return f"{self.tournament.name} R{self.round_number} P{self.position}"
