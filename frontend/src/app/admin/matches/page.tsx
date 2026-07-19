"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Select } from "@/components/ui/Select";
import api, { unwrapList } from "@/lib/api";
import type { GameType, Match, Table, Tournament } from "@/lib/types";

const emptyMatch = {
  game_type: "snooker" as GameType,
  player1_name: "",
  player2_name: "",
  scheduled_at: "",
  round_label: "",
  tournament: "",
  table: "",
};

export default function AdminMatchesPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyMatch);
  const [statusFilter, setStatusFilter] = useState("");

  const matchesQuery = useQuery({
    queryKey: ["admin-matches", statusFilter],
    queryFn: async () => {
      const { data } = await api.get("/matches/", {
        params: statusFilter ? { status: statusFilter } : undefined,
      });
      return unwrapList<Match>(data);
    },
  });

  const tablesQuery = useQuery({
    queryKey: ["admin-tables-mini"],
    queryFn: async () => {
      const { data } = await api.get("/tables/", { params: { is_active: true } });
      return unwrapList<Table>(data);
    },
  });

  const tournamentsQuery = useQuery({
    queryKey: ["admin-tournaments-mini"],
    queryFn: async () => {
      const { data } = await api.get("/tournaments/");
      return unwrapList<Tournament>(data);
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        game_type: form.game_type,
        player1_name: form.player1_name,
        player2_name: form.player2_name,
        round_label: form.round_label,
        status: "scheduled",
        ...(form.scheduled_at
          ? { scheduled_at: new Date(form.scheduled_at).toISOString() }
          : {}),
        ...(form.tournament ? { tournament: Number(form.tournament) } : {}),
        ...(form.table ? { table: Number(form.table) } : {}),
      };
      const { data } = await api.post("/matches/", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("تمت جدولة المباراة");
      setForm(emptyMatch);
      void qc.invalidateQueries({ queryKey: ["admin-matches"] });
    },
    onError: () => toast.error("تعذر إنشاء المباراة"),
  });

  const startMutation = useMutation({
    mutationFn: async ({
      id,
      table,
    }: {
      id: number;
      table?: number;
    }) => {
      const { data } = await api.post(`/matches/${id}/start/`, {
        ...(table ? { table } : {}),
      });
      return data;
    },
    onSuccess: () => {
      toast.success("بدأت المباراة");
      void qc.invalidateQueries({ queryKey: ["admin-matches"] });
    },
    onError: () => toast.error("تعذر بدء المباراة"),
  });

  return (
    <div className="space-y-8">
      <SectionHeading
        title="المباريات"
        description="جدولة المباريات وبدء البث المباشر."
      />

      <GlassCard strong className="space-y-3 max-w-2xl">
        <h3 className="text-[#E8D48B] font-semibold">مباراة جديدة</h3>
        <Select
          label="اللعبة"
          value={form.game_type}
          onChange={(e) =>
            setForm((f) => ({ ...f, game_type: e.target.value as GameType }))
          }
          options={[
            { value: "billiards", label: "بلياردو" },
            { value: "snooker", label: "سنوكر" },
            { value: "cards", label: "ورق" },
          ]}
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            label="اللاعب الأول"
            value={form.player1_name}
            onChange={(e) =>
              setForm((f) => ({ ...f, player1_name: e.target.value }))
            }
          />
          <Input
            label="اللاعب الثاني"
            value={form.player2_name}
            onChange={(e) =>
              setForm((f) => ({ ...f, player2_name: e.target.value }))
            }
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            label="موعد الجدولة"
            type="datetime-local"
            value={form.scheduled_at}
            onChange={(e) =>
              setForm((f) => ({ ...f, scheduled_at: e.target.value }))
            }
          />
          <Input
            label="الجولة / التسمية"
            value={form.round_label}
            onChange={(e) =>
              setForm((f) => ({ ...f, round_label: e.target.value }))
            }
            placeholder="نصف النهائي"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Select
            label="البطولة (اختياري)"
            value={form.tournament}
            onChange={(e) =>
              setForm((f) => ({ ...f, tournament: e.target.value }))
            }
            options={[
              { value: "", label: "بدون بطولة" },
              ...(tournamentsQuery.data ?? []).map((t) => ({
                value: String(t.id),
                label: t.name,
              })),
            ]}
          />
          <Select
            label="الطاولة (اختياري)"
            value={form.table}
            onChange={(e) => setForm((f) => ({ ...f, table: e.target.value }))}
            options={[
              { value: "", label: "بدون طاولة" },
              ...(tablesQuery.data ?? []).map((t) => ({
                value: String(t.id),
                label: t.display_name,
              })),
            ]}
          />
        </div>
        <Button
          loading={createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          جدولة المباراة
        </Button>
      </GlassCard>

      <div className="flex flex-wrap gap-2 items-end">
        <Select
          label="فلتر الحالة"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: "", label: "الكل" },
            { value: "scheduled", label: "مجدول" },
            { value: "live", label: "مباشر" },
            { value: "paused", label: "متوقف" },
            { value: "completed", label: "منتهي" },
          ]}
          className="min-w-[180px]"
        />
      </div>

      <div className="space-y-3">
        {(matchesQuery.data ?? []).map((m) => (
          <GlassCard
            key={m.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge
                  tone={m.status === "live" ? "live" : "muted"}
                  pulse={m.status === "live"}
                >
                  {m.status_display}
                </Badge>
                <span className="text-xs text-[var(--muted)]">
                  {m.game_type_display}
                  {m.round_label ? ` · ${m.round_label}` : ""}
                </span>
              </div>
              <p className="font-semibold">
                {m.display_player1} vs {m.display_player2}
              </p>
              <p className="text-xs text-[var(--muted)] mt-1">
                النتيجة {m.score1} — {m.score2}
                {m.tournament_name ? ` · ${m.tournament_name}` : ""}
              </p>
            </div>
            {(m.status === "scheduled" || m.status === "paused") && (
              <Button
                size="sm"
                loading={startMutation.isPending}
                onClick={() =>
                  startMutation.mutate({
                    id: m.id,
                    table: m.table ?? undefined,
                  })
                }
              >
                بدء المباراة
              </Button>
            )}
          </GlassCard>
        ))}
        {!matchesQuery.isLoading && !matchesQuery.data?.length && (
          <GlassCard className="text-sm text-[var(--muted)]">
            لا توجد مباريات.
          </GlassCard>
        )}
      </div>
    </div>
  );
}
