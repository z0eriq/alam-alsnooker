from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Admin / staff users only. Customers never register."""

    class Role(models.TextChoices):
        ADMIN = "admin", "مدير"
        STAFF = "staff", "موظف"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STAFF,
    )
    phone = models.CharField(max_length=20, blank=True)
    is_active_staff = models.BooleanField(default=True)

    class Meta:
        verbose_name = "مستخدم"
        verbose_name_plural = "المستخدمون"

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"

    @property
    def is_club_admin(self):
        return self.role == self.Role.ADMIN or self.is_superuser
