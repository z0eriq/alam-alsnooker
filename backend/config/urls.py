from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger"),
    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/accounts/", include("apps.accounts.urls")),
    path("api/tables/", include("apps.tables.urls")),
    path("api/bookings/", include("apps.bookings.urls")),
    path("api/tournaments/", include("apps.tournaments.urls")),
    path("api/matches/", include("apps.matches.urls")),
    path("api/live/", include("apps.live.urls")),
    path("api/content/", include("apps.content.urls")),
    path("api/dashboard/", include("apps.accounts.dashboard_urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
