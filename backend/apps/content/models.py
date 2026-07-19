from django.conf import settings
from django.db import models


class Post(models.Model):
    class PostType(models.TextChoices):
        NEWS = "news", "خبر"
        TOURNAMENT = "tournament", "إعلان بطولة"
        WINNER = "winner", "فائز"
        PHOTO = "photo", "صورة"
        OFFER = "offer", "عرض"

    title = models.CharField(max_length=200)
    body = models.TextField()
    post_type = models.CharField(
        max_length=20,
        choices=PostType.choices,
        default=PostType.NEWS,
    )
    image = models.ImageField(upload_to="content/", blank=True, null=True)
    is_published = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="posts",
    )
    published_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-id"]
        verbose_name = "منشور"
        verbose_name_plural = "المنشورات"

    def __str__(self):
        return self.title


class ClubSettings(models.Model):
    """Singleton club info editable from admin."""

    name = models.CharField(max_length=100, default="عالم السنوكر")
    location = models.CharField(max_length=200, default="إربد - دوار السلطان")
    whatsapp = models.CharField(max_length=20, default="962790000000")
    opening_hours = models.CharField(max_length=100, default="10:00 ص — 2:00 ص")
    about = models.TextField(blank=True)
    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)

    class Meta:
        verbose_name = "إعدادات النادي"
        verbose_name_plural = "إعدادات النادي"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
