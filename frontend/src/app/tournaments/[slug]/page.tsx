"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import api, { unwrapList } from "@/lib/api";
import type { Match, Tournament } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function TournamentDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const tournamentQuery = useQuery({
    queryKey: ["tournament", slug],
    queryFn: async () => {
      const { data } = await api.get<Tournament>(`/tournaments/${slug}/`);
      return data;
    },
  });

  const matchesQuery = useQuery({
    queryKey: ["tournament-matches", slug],
    queryFn: async () => {
      const { data } = await api.get(`/tournaments/${slug}/matches/`);
      return unwrapList<Match>(data);
    },
  });

  const t = tournamentQuery.data;

  if (tournamentQuery.isLoading) {
    return (
      <div className="container-page py-14 text-[var(--muted)]">جاري التحميل…</div>
    );
  }

  if (!t) {
    return (
      <div className="container-page py-14">
        <GlassCard>لم يتم العثور على البطولة.</GlassCard>
      </div>
    );
  }

  const bracketByRound = (t.bracket ?? []).reduce<
    Record<number, NonNullable<Tournament["bracket"]>>
  >((acc, node) => {
    acc[node.round_number] = acc[node.round_number] || [];
    acc[node.round_number].push(node);
    return acc;
  }, {});

  return (
    <div className="container-page py-10 sm:py-14 space-y-10">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge tone={t.status === "current" ? "live" : "gold"} pulse={t.status === "current"}>
            {t.status_display}
          </Badge>
          <Badge tone="green">{t.game_type_display}</Badge>
          {t.format_display && <Badge tone="muted">{t.format_display}</Badge>}
        </div>
        <SectionHeading
          title={t.name}
          description={t.description || t.prize_info}
          className="mb-4"
        />
        <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
          <span>
            البداية:{" "}
            {format(new Date(t.start_date), "d MMMM yyyy", { locale: ar })}
          </span>
          {t.entry_fee != null && Number(t.entry_fee) > 0 && (
            <span>رسوم الاشتراك: {formatPrice(t.entry_fee)}</span>
          )}
          <span>
            اللاعبون: {t.players_count}
            {t.max_participants ? ` / ${t.max_participants}` : ""}
          </span>
        </div>
      </div>

      {t.prize_info && (
        <GlassCard>
          <h3 className="text-[#E8D48B] mb-2 font-semibold">الجوائز</h3>
          <p className="text-sm leading-7 whitespace-pre-wrap">{t.prize_info}</p>
        </GlassCard>
      )}

      <section>
        <h3 className="font-display text-2xl gold-text mb-4">اللاعبون</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(t.players ?? []).map((p) => (
            <GlassCard key={p.id} className="!p-3 flex items-center justify-between">
              <span>{p.name}</span>
              {p.seed > 0 && (
                <Badge tone="gold">تصنيف {p.seed}</Badge>
              )}
            </GlassCard>
          ))}
          {!t.players?.length && (
            <p className="text-sm text-[var(--muted)]">لم يُسجَّل لاعبون بعد.</p>
          )}
        </div>
      </section>

      {Object.keys(bracketByRound).length > 0 && (
        <section>
          <h3 className="font-display text-2xl gold-text mb-4">شجرة الإقصاء</h3>
          <div className="space-y-6 overflow-x-auto scrollbar-thin pb-2">
            {Object.entries(bracketByRound)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([round, nodes]) => (
                <div key={round}>
                  <p className="text-sm text-[#D4AF37] mb-2">الجولة {round}</p>
                  <div className="flex gap-3 min-w-max">
                    {nodes
                      .sort((a, b) => a.position - b.position)
                      .map((node) => (
                        <GlassCard key={node.id} className="!p-3 w-52 shrink-0">
                          <p className="text-sm mb-1">
                            {node.player1_name || "—"}
                          </p>
                          <p className="text-sm mb-2">
                            {node.player2_name || "—"}
                          </p>
                          {node.winner_name && (
                            <Badge tone="success">فوز: {node.winner_name}</Badge>
                          )}
                        </GlassCard>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="font-display text-2xl gold-text mb-4">المباريات والنتائج</h3>
        <div className="space-y-3">
          {(matchesQuery.data ?? []).map((m) => (
            <GlassCard key={m.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    tone={m.status === "live" ? "live" : "muted"}
                    pulse={m.status === "live"}
                  >
                    {m.status_display}
                  </Badge>
                  {m.round_label && (
                    <span className="text-xs text-[var(--muted)]">{m.round_label}</span>
                  )}
                </div>
                <p className="font-semibold">
                  {m.display_player1}{" "}
                  <span className="text-[#D4AF37] mx-1">
                    {m.score1} — {m.score2}
                  </span>{" "}
                  {m.display_player2}
                </p>
              </div>
              {m.winner_name && (
                <span className="text-sm text-[#9fd4bc]">الفائز: {m.winner_name}</span>
              )}
            </GlassCard>
          ))}
          {!matchesQuery.data?.length && (
            <p className="text-sm text-[var(--muted)]">لا توجد مباريات بعد.</p>
          )}
        </div>
      </section>
    </div>
  );
}
