from django.contrib import admin

from .models import ClubSettings, Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "post_type", "is_published", "is_featured", "published_at")
    list_filter = ("post_type", "is_published", "is_featured")
    search_fields = ("title", "body")


@admin.register(ClubSettings)
class ClubSettingsAdmin(admin.ModelAdmin):
    list_display = ("name", "location", "whatsapp", "opening_hours")

    def has_add_permission(self, request):
        return not ClubSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
