from django.contrib import admin

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "customer_name",
        "customer_phone",
        "game_type",
        "table",
        "date",
        "start_time",
        "status",
        "total_price",
    )
    list_filter = ("status", "game_type", "date")
    search_fields = ("customer_name", "customer_phone")
    date_hierarchy = "date"
