from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import IsAdminOrStaff

from .models import Table
from .serializers import TableSerializer


class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.all()
    serializer_class = TableSerializer
    permission_classes = [IsAdminOrStaff]
    filterset_fields = ["game_type", "is_active", "is_available"]
    search_fields = ["name", "number"]
    ordering_fields = ["game_type", "number", "hourly_price"]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_authenticated:
            return qs.filter(is_active=True)
        return qs

    @action(detail=False, methods=["get"])
    def summary(self, request):
        data = {}
        for gt, label in Table._meta.get_field("game_type").choices:
            tables = Table.objects.filter(game_type=gt, is_active=True)
            data[gt] = {
                "label": label,
                "count": tables.count(),
                "available": tables.filter(is_available=True).count(),
                "tables": TableSerializer(tables, many=True).data,
            }
        return Response(data)
