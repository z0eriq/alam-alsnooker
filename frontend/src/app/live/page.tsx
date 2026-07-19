"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLiveSocket } from "@/hooks/useLiveSocket";
import api, { unwrapList } from "@/lib/api";
import type { Match } from "@/lib/types";

export default function LivePage() {
  const queryClient = useQueryClient();

  const liveQuery = useQuery({
    queryKey: ["live-matches"],
    queryFn: async () => {
      const { data } = await api.get("/matches/live/");
      return unwrapList<Match>(data);
    },
    refetchInterval: 12_000,
  });

  const onMatchUpdate = useCallback(
    (match: Match) => {
      queryClient.setQueryData<Match[]>(["live-matches"], (prev) => {
        const list = prev ?? [];
        if (match.status !== "live" && match.status !== "paused") {
          return list.filter((m) => m.id !== match.id);
        }
        const idx = list.findIndex((m) => m.id === match.id);
        if (idx === -1) return [match, ...list];
        const next = [...list];
        next[idx] = match;
        return next;
      });
    },
    [queryClient]
  );

  const { connected } = useLiveSocket({ onMatchUpdate });

  const matches = liveQuery.data ?? [];

  return (
    <div className="container-page py-10 sm:py-14">
      <SectionHeading
        title="المركز المباشر"
        description="نتائج لحظية لمباريات عالم السنوكر."
        action={
          <Badge tone={connected ? "success" : "muted"}>
            {connected ? "متصل مباشرة" : "إعادة اتصال…"}
          </Badge>
        }
      />

      {liveQuery.isLoading && (
        <p className="text-sm text-[var(--muted)]">جاري جلب المباريات…</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {matches.map((m) => (
          <GlassCard key={m.id} strong className="relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-0.5 gold-shimmer" />
            <div className="flex items-center justify-between mb-4">
              <Badge tone="live" pulse>
                ● مباشر
              </Badge>
              <span className="text-xs text-[var(--muted)]">
                {m.game_type_display}
                {m.round_label ? ` · ${m.round_label}` : ""}
              </span>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
              <div>
                <p className="font-semibold text-base sm:text-lg leading-snug">
                  {m.display_player1}
                </p>
              </div>
              <div className="font-display text-3xl sm:text-4xl gold-text tabular-nums px-2">
                {m.score1}
                <span className="mx-1 text-[var(--muted)] text-xl">:</span>
                {m.score2}
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg leading-snug">
                  {m.display_player2}
                </p>
              </div>
            </div>

            {m.tournament_name && (
              <p className="mt-4 text-xs text-center text-[#E8D48B]">
                {m.tournament_name}
              </p>
            )}
            {m.table_detail && (
              <p className="mt-1 text-xs text-center text-[var(--muted)]">
                {m.table_detail.display_name}
              </p>
            )}
          </GlassCard>
        ))}
      </div>

      {!liveQuery.isLoading && matches.length === 0 && (
        <GlassCard className="text-center text-[var(--muted)] mt-2">
          لا توجد مباريات مباشرة الآن. تابعنا قريباً!
        </GlassCard>
      )}
    </div>
  );
}
