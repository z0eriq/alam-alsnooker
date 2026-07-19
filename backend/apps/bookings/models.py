from django.db import models

from apps.tables.models import GameType, Table


class Booking(models.Model):
    """Guest table reservation — no customer account required."""

    class Status(models.TextChoices):
        PENDING = "pending", "قيد الانتظار"
        CONFIRMED = "confirmed", "مؤكد"
        COMPLETED = "completed", "مكتمل"
        CANCELLED = "cancelled", "ملغي"

    game_type = models.CharField(max_length=20, choices=GameType.choices)
    table = models.ForeignKey(
        Table,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bookings",
    )
    customer_name = models.CharField(max_length=120)
    customer_phone = models.CharField(max_length=20)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_hours = models.DecimalField(max_digits=4, decimal_places=1, default=1.0)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-start_time"]
        verbose_name = "حجز"
        verbose_name_plural = "الحجوزات"
        indexes = [
            models.Index(fields=["date", "status"]),
            models.Index(fields=["game_type", "date"]),
        ]

    def __str__(self):
        return f"{self.customer_name} — {self.date} {self.start_time}"

    def calculate_price(self):
        if self.table:
            self.total_price = self.table.hourly_price * self.duration_hours
        return self.total_price
