from django.contrib import admin

from .models import Table


@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = (
        "display_name",
        "game_type",
        "number",
        "hourly_price",
        "is_active",
        "is_available",
    )
    list_filter = ("game_type", "is_active", "is_available")
    search_fields = ("name", "number")
    list_editable = ("hourly_price", "is_active", "is_available")
