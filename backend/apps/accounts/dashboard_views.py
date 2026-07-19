from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminOrStaffStrict
from apps.bookings.models import Booking
from apps.matches.models import Match
from apps.tables.models import Table
from apps.tournaments.models import Tournament


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrStaffStrict]

    def get(self, request):
        today = timezone.localdate()
        bookings_today = Booking.objects.filter(date=today).exclude(
            status=Booking.Status.CANCELLED
        )
        return Response(
            {
                "today_bookings": bookings_today.count(),
                "pending_bookings": bookings_today.filter(
                    status=Booking.Status.PENDING
                ).count(),
                "confirmed_bookings": bookings_today.filter(
                    status=Booking.Status.CONFIRMED
                ).count(),
                "active_games": Match.objects.filter(status=Match.Status.LIVE).count(),
                "upcoming_tournaments": Tournament.objects.filter(
                    status=Tournament.Status.UPCOMING
                ).count(),
                "current_tournaments": Tournament.objects.filter(
                    status=Tournament.Status.CURRENT
                ).count(),
                "available_tables": Table.objects.filter(
                    is_active=True, is_available=True
                ).count(),
                "total_tables": Table.objects.filter(is_active=True).count(),
                "revenue_today": float(
                    bookings_today.filter(
                        status__in=[
                            Booking.Status.CONFIRMED,
                            Booking.Status.COMPLETED,
                        ]
                    ).aggregate(total=Sum("total_price"))["total"]
                    or 0
                ),
                "revenue_month": float(
                    Booking.objects.filter(
                        date__year=today.year,
                        date__month=today.month,
                        status__in=[
                            Booking.Status.CONFIRMED,
                            Booking.Status.COMPLETED,
                        ],
                    ).aggregate(total=Sum("total_price"))["total"]
                    or 0
                ),
                "tables_by_type": list(
                    Table.objects.filter(is_active=True)
                    .values("game_type")
                    .annotate(
                        total=Count("id"),
                        available=Count("id", filter=Q(is_available=True)),
                    )
                ),
            }
        )
