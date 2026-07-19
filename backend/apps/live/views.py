from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminOrStaff
from apps.matches.models import Match
from apps.matches.serializers import MatchSerializer

from .models import LiveSession, ScoreEvent
from .serializers import LiveSessionSerializer, ScoreEventSerializer


class LiveFeedView(APIView):
    """Public live center feed."""

    permission_classes = [AllowAny]

    def get(self, request):
        live = Match.objects.filter(status=Match.Status.LIVE).select_related(
            "table", "player1", "player2", "tournament"
        )
        recent = (
            Match.objects.filter(status=Match.Status.COMPLETED)
            .select_related("table", "player1", "player2")
            .order_by("-ended_at")[:10]
        )
        scheduled = (
            Match.objects.filter(status=Match.Status.SCHEDULED)
            .select_related("table", "player1", "player2", "tournament")
            .order_by("scheduled_at")[:10]
        )
        return Response(
            {
                "live": MatchSerializer(live, many=True).data,
                "recent": MatchSerializer(recent, many=True).data,
                "scheduled": MatchSerializer(scheduled, many=True).data,
            }
        )


class LiveSessionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LiveSession.objects.filter(is_active=True).select_related(
        "match", "match__table", "match__player1", "match__player2"
    )
    serializer_class = LiveSessionSerializer
    permission_classes = [AllowAny]


class ScoreEventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ScoreEvent.objects.select_related("match").all()
    serializer_class = ScoreEventSerializer
    permission_classes = [IsAdminOrStaff]
    filterset_fields = ["match"]
