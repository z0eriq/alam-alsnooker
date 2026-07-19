from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.accounts.permissions import IsAdminOrStaff
from apps.matches.models import Match
from apps.matches.serializers import MatchSerializer

from .models import Player, Tournament
from .serializers import (
    PlayerSerializer,
    TournamentListSerializer,
    TournamentSerializer,
    generate_knockout_bracket,
)


class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.prefetch_related("players", "bracket_nodes").all()
    lookup_field = "slug"
    filterset_fields = ["game_type", "status", "format", "is_published"]
    search_fields = ["name", "description", "prize_info"]
    ordering_fields = ["start_date", "created_at", "name"]

    def get_serializer_class(self):
        if self.action == "list":
            return TournamentListSerializer
        return TournamentSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve", "matches"):
            return [AllowAny()]
        return [IsAdminOrStaff()]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_authenticated:
            return qs.filter(is_published=True)
        return qs

    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrStaff])
    def add_player(self, request, slug=None):
        tournament = self.get_object()
        data = {**request.data, "tournament": tournament.id}
        serializer = PlayerSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        if tournament.players.count() >= tournament.max_participants:
            return Response(
                {"detail": "تم الوصول للحد الأقصى للمشاركين."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        player = serializer.save()
        return Response(PlayerSerializer(player).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrStaff])
    def generate_bracket(self, request, slug=None):
        tournament = self.get_object()
        if tournament.format != Tournament.Format.KNOCKOUT:
            # For groups/league: create round-robin style schedule
            players = list(tournament.players.order_by("seed", "id"))
            Match.objects.filter(tournament=tournament).delete()
            created = []
            idx = 0
            for i, p1 in enumerate(players):
                for p2 in players[i + 1 :]:
                    m = Match.objects.create(
                        tournament=tournament,
                        game_type=tournament.game_type,
                        player1=p1,
                        player2=p2,
                        status=Match.Status.SCHEDULED,
                        round_label="دوري",
                    )
                    created.append(m)
                    idx += 1
            return Response(
                {
                    "detail": f"تم إنشاء {len(created)} مباراة.",
                    "matches": MatchSerializer(created, many=True).data,
                }
            )
        nodes = generate_knockout_bracket(tournament)
        return Response(
            {
                "detail": f"تم إنشاء الشجرة ({len(nodes)} عقدة).",
                "tournament": TournamentSerializer(tournament).data,
            }
        )

    @action(detail=True, methods=["get"], permission_classes=[AllowAny])
    def matches(self, request, slug=None):
        tournament = self.get_object()
        matches = Match.objects.filter(tournament=tournament).select_related(
            "table", "player1", "player2"
        )
        return Response(MatchSerializer(matches, many=True).data)


class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.select_related("tournament").all()
    serializer_class = PlayerSerializer
    permission_classes = [IsAdminOrStaff]
    filterset_fields = ["tournament"]
    search_fields = ["name", "phone"]
