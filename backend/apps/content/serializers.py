from rest_framework import serializers

from .models import ClubSettings, Post


class PostSerializer(serializers.ModelSerializer):
    post_type_display = serializers.CharField(
        source="get_post_type_display", read_only=True
    )
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            "id",
            "title",
            "body",
            "post_type",
            "post_type_display",
            "image",
            "is_published",
            "is_featured",
            "author",
            "author_name",
            "published_at",
            "updated_at",
        )
        read_only_fields = ("author", "published_at", "updated_at")

    def get_author_name(self, obj):
        if obj.author:
            return obj.author.get_full_name() or obj.author.username
        return None


class ClubSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClubSettings
        fields = (
            "name",
            "location",
            "whatsapp",
            "opening_hours",
            "about",
            "facebook_url",
            "instagram_url",
        )
