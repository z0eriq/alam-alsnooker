"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CalendarCheck,
  CircleDollarSign,
  Radio,
  Table2,
  Trophy,
} from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import api from "@/lib/api";
import type { DashboardStats } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get<DashboardStats>("/dashboard/stats/");
      return data;
    },
    refetchInterval: 30_000,
  });

  const cards = [
    {
      label: "حجوزات اليوم",
      value: data?.today_bookings ?? "—",
      icon: CalendarCheck,
      sub: `${data?.pending_bookings ?? 0} قيد الانتظار`,
    },
    {
      label: "مباريات مباشرة",
      value: data?.active_games ?? "—",
      icon: Radio,
      sub: "نشطة الآن",
    },
    {
      label: "الطاولات المتاحة",
      value:
        data != null
          ? `${data.available_tables} / ${data.total_tables}`
          : "—",
      icon: Table2,
      sub: "نشطة ومتاحة",
    },
    {
      label: "إيراد اليوم",
      value: data != null ? formatPrice(data.revenue_today) : "—",
      icon: CircleDollarSign,
      sub:
        data != null
          ? `الشهر: ${formatPrice(data.revenue_month)}`
          : "—",
    },
    {
      label: "بطولات جارية",
      value: data?.current_tournaments ?? "—",
      icon: Trophy,
      sub: `${data?.upcoming_tournaments ?? 0} قادمة`,
    },
  ];

  return (
    <div>
      <SectionHeading
        title="لوحة التحكم"
        description="نظرة سريعة على أداء النادي اليوم."
      />

      {isLoading && <p className="text-sm text-[var(--muted)]">جاري التحميل…</p>}
      {isError && (
        <GlassCard className="text-[#ffb4b4] mb-4">
          تعذر جلب الإحصائيات. تأكد من صلاحيات الدخول.
        </GlassCard>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <GlassCard key={c.label} className="flex items-start gap-4">
              <div className="size-11 rounded-xl bg-[rgba(15,76,58,0.5)] border border-[rgba(201,162,39,0.25)] inline-flex items-center justify-center text-[#D4AF37] shrink-0">
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">{c.label}</p>
                <p className="text-2xl font-semibold mt-1">{c.value}</p>
                <p className="text-xs text-[#E8D48B] mt-1">{c.sub}</p>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {data?.tables_by_type && data.tables_by_type.length > 0 && (
        <GlassCard className="mt-6">
          <h3 className="text-[#E8D48B] font-semibold mb-3">الطاولات حسب النوع</h3>
          <div className="grid gap-2 sm:grid-cols-3">
            {data.tables_by_type.map((row) => (
              <div
                key={row.game_type}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm"
              >
                <p className="text-[var(--muted)] mb-1">
                  {row.game_type === "billiards"
                    ? "بلياردو"
                    : row.game_type === "snooker"
                      ? "سنوكر"
                      : "ورق"}
                </p>
                <p>
                  متاح {row.available} من {row.total}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
