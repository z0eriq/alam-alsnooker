from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.accounts.permissions import IsAdminOrStaff
from apps.live.models import LiveSession, ScoreEvent

from .models import Match
from .serializers import MatchSerializer


def broadcast_match(event: str, match: Match):
    channel_layer = get_channel_layer()
    if channel_layer:
        payload = MatchSerializer(match).data
        async_to_sync(channel_layer.group_send)(
            "live_matches",
            {"type": "match.update", "event": event, "match": payload},
        )


class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.select_related(
        "table", "player1", "player2", "tournament"
    ).all()
    serializer_class = MatchSerializer
    filterset_fields = ["status", "game_type", "tournament", "table"]
    search_fields = ["player1_name", "player2_name", "round_label"]
    ordering_fields = ["scheduled_at", "created_at", "status"]

    def get_permissions(self):
        if self.action in ("list", "retrieve", "live"):
            return [AllowAny()]
        return [IsAdminOrStaff()]

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def live(self, request):
        matches = self.get_queryset().filter(status=Match.Status.LIVE)
        return Response(MatchSerializer(matches, many=True).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrStaff])
    def start(self, request, pk=None):
        match = self.get_object()
        table_id = request.data.get("table")
        if table_id:
            match.table_id = table_id
        match.status = Match.Status.LIVE
        match.started_at = timezone.now()
        match.save()
        LiveSession.objects.update_or_create(
            match=match, defaults={"is_active": True}
        )
        broadcast_match("started", match)
        return Response(MatchSerializer(match).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrStaff])
    def score(self, request, pk=None):
        match = self.get_object()
        if "score1" in request.data:
            match.score1 = int(request.data["score1"])
        if "score2" in request.data:
            match.score2 = int(request.data["score2"])
        # Convenience increments
        if request.data.get("inc1"):
            match.score1 += 1
        if request.data.get("inc2"):
            match.score2 += 1
        if request.data.get("dec1") and match.score1 > 0:
            match.score1 -= 1
        if request.data.get("dec2") and match.score2 > 0:
            match.score2 -= 1
        match.save(update_fields=["score1", "score2", "updated_at"])
        ScoreEvent.objects.create(
            match=match,
            score1=match.score1,
            score2=match.score2,
            note=request.data.get("note", ""),
        )
        broadcast_match("score", match)
        return Response(MatchSerializer(match).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrStaff])
    def finish(self, request, pk=None):
        match = self.get_object()
        match.status = Match.Status.COMPLETED
        match.ended_at = timezone.now()
        match.set_winner_from_scores()
        if request.data.get("winner_name"):
            match.winner_name = request.data["winner_name"]
        match.save()
        LiveSession.objects.filter(match=match).update(is_active=False)
        # Advance bracket if linked
        if hasattr(match, "bracket_node") and match.bracket_node and match.winner:
            node = match.bracket_node
            node.winner = match.winner
            node.save(update_fields=["winner"])
            next_node = match.tournament.bracket_nodes.filter(
                round_number=node.round_number + 1,
                position=node.position // 2,
            ).first()
            if next_node:
                if node.position % 2 == 0:
                    next_node.player1 = match.winner
                else:
                    next_node.player2 = match.winner
                next_node.save()
                if next_node.player1 and next_node.player2 and not next_node.match:
                    next_match = Match.objects.create(
                        tournament=match.tournament,
                        game_type=match.game_type,
                        player1=next_node.player1,
                        player2=next_node.player2,
                        status=Match.Status.SCHEDULED,
                        round_label=f"الجولة {next_node.round_number}",
                    )
                    next_node.match = next_match
                    next_node.save(update_fields=["match", "player1", "player2"])
        broadcast_match("finished", match)
        return Response(MatchSerializer(match).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrStaff])
    def pause(self, request, pk=None):
        match = self.get_object()
        match.status = Match.Status.PAUSED
        match.save(update_fields=["status", "updated_at"])
        broadcast_match("paused", match)
        return Response(MatchSerializer(match).data)
