from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.content.models import ClubSettings, Post
from apps.tables.models import GameType, Table
from apps.tournaments.models import Player, Tournament

User = get_user_model()


class Command(BaseCommand):
    help = "Seed عالم السنوكر with tables, admin user, sample content"

    def handle(self, *args, **options):
        admin, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@alamalsnooker.jo",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "first_name": "مدير",
                "last_name": "النادي",
            },
        )
        if created:
            admin.set_password("admin123")
            admin.save()
            self.stdout.write(self.style.SUCCESS("Created admin / admin123"))
        else:
            self.stdout.write("Admin user already exists")

        staff, s_created = User.objects.get_or_create(
            username="staff",
            defaults={
                "email": "staff@alamalsnooker.jo",
                "role": User.Role.STAFF,
                "is_staff": True,
                "first_name": "موظف",
            },
        )
        if s_created:
            staff.set_password("staff123")
            staff.save()
            self.stdout.write(self.style.SUCCESS("Created staff / staff123"))

        counts = {
            GameType.BILLIARDS: 5,
            GameType.SNOOKER: 6,
            GameType.CARDS: 5,
        }
        prices = {
            GameType.BILLIARDS: Decimal("5.00"),
            GameType.SNOOKER: Decimal("7.00"),
            GameType.CARDS: Decimal("3.00"),
        }
        for gt, count in counts.items():
            for n in range(1, count + 1):
                Table.objects.get_or_create(
                    game_type=gt,
                    number=n,
                    defaults={"hourly_price": prices[gt], "is_active": True},
                )
        self.stdout.write(self.style.SUCCESS(f"Tables ready: {Table.objects.count()}"))

        ClubSettings.get_solo()

        if not Tournament.objects.exists():
            t = Tournament.objects.create(
                name="بطولة إربد المفتوحة للسنوكر",
                slug=slugify("بطولة إربد المفتوحة للسنوكر", allow_unicode=True),
                game_type=GameType.SNOOKER,
                format=Tournament.Format.KNOCKOUT,
                status=Tournament.Status.UPCOMING,
                start_date=date.today() + timedelta(days=7),
                prize_info="الجائزة الأولى: 200 دينار + كأس",
                description="بطولة مفتوحة لجميع اللاعبين في إربد والمناطق المجاورة.",
                max_participants=8,
                entry_fee=Decimal("10.00"),
            )
            names = [
                "أحمد خالد",
                "محمد علي",
                "يوسف حسن",
                "عمر سامر",
                "خالد وليد",
                "سامي فادي",
                "رامي نبيل",
                "باسم طارق",
            ]
            for i, name in enumerate(names, start=1):
                Player.objects.create(
                    tournament=t,
                    name=name,
                    phone=f"079000000{i}",
                    ranking=i,
                    seed=i,
                )
            self.stdout.write(self.style.SUCCESS("Sample tournament created"))

        if not Post.objects.exists():
            Post.objects.create(
                title="مرحباً بكم في عالم السنوكر",
                body="نادي عالم السنوكر في إربد - دوار السلطان يفتح أبوابه لكم بأجواء فاخرة وطاولات احترافية.",
                post_type=Post.PostType.NEWS,
                is_featured=True,
                author=admin,
            )
            Post.objects.create(
                title="عرض الافتتاح: ساعة مجانية",
                body="احجز ساعتين واحصل على الساعة الثالثة مجاناً خلال هذا الأسبوع.",
                post_type=Post.PostType.OFFER,
                is_featured=True,
                author=admin,
            )
            self.stdout.write(self.style.SUCCESS("Sample posts created"))

        self.stdout.write(self.style.SUCCESS("Seed complete."))
