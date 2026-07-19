from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminOrStaff

from .models import ClubSettings, Post
from .serializers import ClubSettingsSerializer, PostSerializer


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    filterset_fields = ["post_type", "is_published", "is_featured"]
    search_fields = ["title", "body"]
    ordering_fields = ["published_at", "updated_at"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminOrStaff()]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_authenticated:
            return qs.filter(is_published=True)
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class ClubInfoView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        settings = ClubSettings.get_solo()
        return Response(ClubSettingsSerializer(settings).data)

    def patch(self, request):
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({"detail": "غير مصرح."}, status=403)
        settings = ClubSettings.get_solo()
        serializer = ClubSettingsSerializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
