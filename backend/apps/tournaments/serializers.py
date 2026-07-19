import math
from datetime import datetime, time, timedelta

from django.utils import timezone
from django.utils.text import slugify
from rest_framework import serializers

from apps.matches.models import Match

from .models import BracketNode, Player, Tournament


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = (
            "id",
            "tournament",
            "name",
            "phone",
            "ranking",
            "seed",
            "notes",
            "is_eliminated",
            "created_at",
        )
        read_only_fields = ("created_at",)


class BracketNodeSerializer(serializers.ModelSerializer):
    player1_name = serializers.CharField(source="player1.name", read_only=True, default=None)
    player2_name = serializers.CharField(source="player2.name", read_only=True, default=None)
    winner_name = serializers.CharField(source="winner.name", read_only=True, default=None)

    class Meta:
        model = BracketNode
        fields = (
            "id",
            "tournament",
            "round_number",
            "position",
            "player1",
            "player2",
            "winner",
            "player1_name",
            "player2_name",
            "winner_name",
            "match",
        )


class TournamentSerializer(serializers.ModelSerializer):
    players = PlayerSerializer(many=True, read_only=True)
    bracket = BracketNodeSerializer(source="bracket_nodes", many=True, read_only=True)
    players_count = serializers.IntegerField(source="players.count", read_only=True)
    game_type_display = serializers.CharField(
        source="get_game_type_display", read_only=True
    )
    format_display = serializers.CharField(source="get_format_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Tournament
        fields = (
            "id",
            "name",
            "slug",
            "game_type",
            "game_type_display",
            "format",
            "format_display",
            "status",
            "status_display",
            "start_date",
            "end_date",
            "prize_info",
            "description",
            "max_participants",
            "entry_fee",
            "cover_image",
            "is_published",
            "players_count",
            "players",
            "bracket",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("slug", "created_at", "updated_at")

    def create(self, validated_data):
        name = validated_data["name"]
        base = slugify(name, allow_unicode=True) or "tournament"
        slug = base
        i = 1
        while Tournament.objects.filter(slug=slug).exists():
            slug = f"{base}-{i}"
            i += 1
        validated_data["slug"] = slug
        return super().create(validated_data)


class TournamentListSerializer(serializers.ModelSerializer):
    players_count = serializers.IntegerField(source="players.count", read_only=True)
    game_type_display = serializers.CharField(
        source="get_game_type_display", read_only=True
    )
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Tournament
        fields = (
            "id",
            "name",
            "slug",
            "game_type",
            "game_type_display",
            "format",
            "status",
            "status_display",
            "start_date",
            "end_date",
            "prize_info",
            "players_count",
            "is_published",
            "cover_image",
        )


def next_power_of_two(n: int) -> int:
    if n <= 1:
        return 1
    return 2 ** math.ceil(math.log2(n))


def generate_knockout_bracket(tournament: Tournament) -> list[BracketNode]:
    """Generate bracket nodes and scheduled matches for knockout format."""
    players = list(tournament.players.order_by("seed", "ranking", "id"))
    if len(players) < 2:
        return []

    size = next_power_of_two(len(players))
    # Pad with byes (None)
    padded = players + [None] * (size - len(players))

    BracketNode.objects.filter(tournament=tournament).delete()
    Match.objects.filter(tournament=tournament).delete()

    rounds = int(math.log2(size))
    nodes: list[BracketNode] = []
    start = timezone.make_aware(
        datetime.combine(tournament.start_date, time(16, 0))
    )

    # Round 1 pairings
    round1_nodes = []
    for i in range(0, size, 2):
        p1, p2 = padded[i], padded[i + 1]
        pos = i // 2
        match = None
        if p1 and p2:
            match = Match.objects.create(
                tournament=tournament,
                game_type=tournament.game_type,
                player1=p1,
                player2=p2,
                status=Match.Status.SCHEDULED,
                scheduled_at=start + timedelta(minutes=30 * pos),
                round_label=f"الجولة 1",
            )
        node = BracketNode.objects.create(
            tournament=tournament,
            round_number=1,
            position=pos,
            player1=p1,
            player2=p2,
            match=match,
            winner=p1 if p1 and not p2 else (p2 if p2 and not p1 else None),
        )
        round1_nodes.append(node)
        nodes.append(node)

    # Placeholder nodes for later rounds
    prev_count = len(round1_nodes)
    for rnd in range(2, rounds + 1):
        count = prev_count // 2
        for pos in range(count):
            node = BracketNode.objects.create(
                tournament=tournament,
                round_number=rnd,
                position=pos,
            )
            nodes.append(node)
        prev_count = count

    return nodes
