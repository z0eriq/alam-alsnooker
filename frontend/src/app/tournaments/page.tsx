"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import api, { unwrapList } from "@/lib/api";
import type { Tournament, TournamentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS: Array<{ key: TournamentStatus; label: string }> = [
  { key: "current", label: "الجارية" },
  { key: "upcoming", label: "القادمة" },
  { key: "previous", label: "السابقة" },
];

export default function TournamentsPage() {
  const [tab, setTab] = useState<TournamentStatus>("current");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tournaments", tab],
    queryFn: async () => {
      const { data } = await api.get("/tournaments/", {
        params: { status: tab },
      });
      return unwrapList<Tournament>(data);
    },
  });

  return (
    <div className="container-page py-10 sm:py-14">
      <SectionHeading
        title="البطولات"
        description="جميع بطولات عالم السنوكر — الجارية والقادمة والسابقة."
      />

      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm border transition",
              tab === t.key
                ? "border-[#D4AF37] bg-[rgba(201,162,39,0.15)] text-[#E8D48B]"
                : "border-white/10 text-[var(--muted)] hover:border-[rgba(201,162,39,0.3)]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <p className="text-[var(--muted)] text-sm">جاري التحميل…</p>
      )}
      {isError && (
        <GlassCard className="text-[#ffb4b4]">تعذر تحميل البطولات.</GlassCard>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((t) => (
          <Link key={t.id} href={`/tournaments/${t.slug}`}>
            <GlassCard hover className="h-full">
              <div className="flex items-center justify-between gap-2 mb-3">
                <Badge
                  tone={
                    t.status === "current"
                      ? "live"
                      : t.status === "upcoming"
                        ? "gold"
                        : "muted"
                  }
                  pulse={t.status === "current"}
                >
                  {t.status_display}
                </Badge>
                <span className="text-xs text-[var(--muted)]">
                  {t.game_type_display}
                </span>
              </div>
              <h2 className="text-xl font-semibold mb-2">{t.name}</h2>
              <p className="text-sm text-[var(--muted)] line-clamp-2 min-h-[2.5rem]">
                {t.prize_info || "تفاصيل الجائزة عند الافتتاح"}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-[#E8D48B]">
                <span>
                  {format(new Date(t.start_date), "d MMM yyyy", { locale: ar })}
                </span>
                <span>{t.players_count} لاعب</span>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>

      {!isLoading && data?.length === 0 && (
        <GlassCard className="text-center text-[var(--muted)] mt-4">
          لا توجد بطولات في هذا القسم حالياً.
        </GlassCard>
      )}
    </div>
  );
}
