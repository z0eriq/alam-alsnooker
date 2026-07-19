from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrStaff(BasePermission):
    """Only authenticated admin/staff can write."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_staff or getattr(user, "is_active_staff", False))
        )


class IsAdminOrStaffStrict(BasePermission):
    """Requires authentication for all methods."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_staff or getattr(user, "is_active_staff", False))
        )


class AllowAnyCreate(BasePermission):
    """Public create (bookings), authenticated for admin mutations."""

    def has_permission(self, request, view):
        if request.method == "POST" and getattr(view, "action", None) in (
            "create",
            None,
        ):
            return True
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and user.is_staff)
