"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Pause, Plus, Square } from "lucide-react";
import { useCallback } from "react";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLiveSocket } from "@/hooks/useLiveSocket";
import api, { unwrapList } from "@/lib/api";
import type { Match } from "@/lib/types";

export default function AdminLiveControlPage() {
  const qc = useQueryClient();

  const liveQuery = useQuery({
    queryKey: ["admin-live-matches"],
    queryFn: async () => {
      const { data } = await api.get("/matches/", {
        params: { status: "live" },
      });
      const live = unwrapList<Match>(data);
      const pausedRes = await api.get("/matches/", {
        params: { status: "paused" },
      });
      return [...live, ...unwrapList<Match>(pausedRes.data)];
    },
    refetchInterval: 10_000,
  });

  const onMatchUpdate = useCallback(
    (match: Match) => {
      queryClientPatch(qc, match);
    },
    [qc]
  );

  const { connected } = useLiveSocket({ onMatchUpdate });

  const scoreMutation = useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: number;
      body: Record<string, number | boolean>;
    }) => {
      const { data } = await api.post(`/matches/${id}/score/`, body);
      return data as Match;
    },
    onSuccess: (match) => {
      queryClientPatch(qc, match);
    },
    onError: () => toast.error("تعذر تحديث النتيجة"),
  });

  const actionMutation = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: number;
      action: "finish" | "pause" | "start";
    }) => {
      const { data } = await api.post(`/matches/${id}/${action}/`);
      return data as Match;
    },
    onSuccess: (match, vars) => {
      toast.success(
        vars.action === "finish"
          ? "انتهت المباراة"
          : vars.action === "pause"
            ? "تم الإيقاف مؤقتاً"
            : "استُؤنفت المباراة"
      );
      void qc.invalidateQueries({ queryKey: ["admin-live-matches"] });
      queryClientPatch(qc, match);
    },
    onError: () => toast.error("فشلت العملية"),
  });

  const matches = liveQuery.data ?? [];

  return (
    <div className="space-y-6">
      <SectionHeading
        title="التحكم المباشر"
        description="تعديل النتائج لحظياً، إيقاف أو إنهاء المباريات."
        action={
          <Badge tone={connected ? "success" : "muted"}>
            {connected ? "WebSocket متصل" : "غير متصل"}
          </Badge>
        }
      />

      {liveQuery.isLoading && (
        <p className="text-sm text-[var(--muted)]">جاري التحميل…</p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {matches.map((m) => (
          <GlassCard key={m.id} strong className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge tone={m.status === "live" ? "live" : "gold"} pulse={m.status === "live"}>
                {m.status_display}
              </Badge>
              <span className="text-xs text-[var(--muted)]">
                {m.game_type_display}
                {m.round_label ? ` · ${m.round_label}` : ""}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <PlayerScore
                name={m.display_player1}
                score={m.score1}
                onInc={() =>
                  scoreMutation.mutate({ id: m.id, body: { inc1: true } })
                }
                onDec={() =>
                  scoreMutation.mutate({ id: m.id, body: { dec1: true } })
                }
                disabled={scoreMutation.isPending}
              />
              <PlayerScore
                name={m.display_player2}
                score={m.score2}
                onInc={() =>
                  scoreMutation.mutate({ id: m.id, body: { inc2: true } })
                }
                onDec={() =>
                  scoreMutation.mutate({ id: m.id, body: { dec2: true } })
                }
                disabled={scoreMutation.isPending}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {m.status === "live" && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Pause className="size-3.5" />}
                  onClick={() =>
                    actionMutation.mutate({ id: m.id, action: "pause" })
                  }
                >
                  إيقاف
                </Button>
              )}
              {m.status === "paused" && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    actionMutation.mutate({ id: m.id, action: "start" })
                  }
                >
                  استئناف
                </Button>
              )}
              <Button
                size="sm"
                variant="danger"
                leftIcon={<Square className="size-3.5" />}
                onClick={() => {
                  if (confirm("إنهاء المباراة؟")) {
                    actionMutation.mutate({ id: m.id, action: "finish" });
                  }
                }}
              >
                إنهاء
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>

      {!liveQuery.isLoading && matches.length === 0 && (
        <GlassCard className="text-sm text-[var(--muted)]">
          لا توجد مباريات مباشرة أو متوقفة. ابدأ مباراة من قسم المباريات.
        </GlassCard>
      )}
    </div>
  );
}

function queryClientPatch(
  qc: ReturnType<typeof useQueryClient>,
  match: Match
) {
  qc.setQueryData<Match[]>(["admin-live-matches"], (prev) => {
    const list = prev ?? [];
    if (match.status === "completed" || match.status === "cancelled") {
      return list.filter((m) => m.id !== match.id);
    }
    const idx = list.findIndex((m) => m.id === match.id);
    if (idx === -1) {
      if (match.status === "live" || match.status === "paused") {
        return [match, ...list];
      }
      return list;
    }
    const next = [...list];
    next[idx] = match;
    return next;
  });
}

function PlayerScore({
  name,
  score,
  onInc,
  onDec,
  disabled,
}: {
  name: string;
  score: number;
  onInc: () => void;
  onDec: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[rgba(201,162,39,0.2)] bg-black/20 p-3 text-center">
      <p className="text-sm mb-2 line-clamp-2 min-h-[2.5rem]">{name}</p>
      <p className="font-display text-4xl gold-text tabular-nums mb-3">{score}</p>
      <div className="flex justify-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={disabled}
          onClick={onDec}
          aria-label="إنقاص"
        >
          <Minus className="size-4" />
        </Button>
        <Button size="sm" disabled={disabled} onClick={onInc} aria-label="زيادة">
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}
