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
import type { GameType, Tournament, TournamentFormat, TournamentStatus } from "@/lib/types";

const emptyTournament = {
  name: "",
  game_type: "snooker" as GameType,
  format: "knockout" as TournamentFormat,
  status: "upcoming" as TournamentStatus,
  start_date: "",
  prize_info: "",
  description: "",
  max_participants: "16",
  entry_fee: "0",
  is_published: true,
};

export default function AdminTournamentsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyTournament);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [playerPhone, setPlayerPhone] = useState("");

  const listQuery = useQuery({
    queryKey: ["admin-tournaments"],
    queryFn: async () => {
      const { data } = await api.get("/tournaments/");
      return unwrapList<Tournament>(data);
    },
  });

  const detailQuery = useQuery({
    queryKey: ["admin-tournament", selectedSlug],
    enabled: !!selectedSlug,
    queryFn: async () => {
      const { data } = await api.get<Tournament>(`/tournaments/${selectedSlug}/`);
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/tournaments/", {
        ...form,
        max_participants: Number(form.max_participants),
        entry_fee: form.entry_fee,
      });
      return data as Tournament;
    },
    onSuccess: (t) => {
      toast.success("تم إنشاء البطولة");
      setForm(emptyTournament);
      setSelectedSlug(t.slug);
      void qc.invalidateQueries({ queryKey: ["admin-tournaments"] });
    },
    onError: () => toast.error("تعذر إنشاء البطولة"),
  });

  const addPlayerMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSlug) throw new Error("no slug");
      const { data } = await api.post(`/tournaments/${selectedSlug}/add_player/`, {
        name: playerName,
        phone: playerPhone,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("تمت إضافة اللاعب");
      setPlayerName("");
      setPlayerPhone("");
      void qc.invalidateQueries({ queryKey: ["admin-tournament", selectedSlug] });
      void qc.invalidateQueries({ queryKey: ["admin-tournaments"] });
    },
    onError: () => toast.error("تعذر إضافة اللاعب"),
  });

  const bracketMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSlug) throw new Error("no slug");
      const { data } = await api.post(
        `/tournaments/${selectedSlug}/generate_bracket/`
      );
      return data;
    },
    onSuccess: (res: { detail?: string }) => {
      toast.success(res.detail || "تم إنشاء الشجرة");
      void qc.invalidateQueries({ queryKey: ["admin-tournament", selectedSlug] });
    },
    onError: () => toast.error("تعذر إنشاء الشجرة"),
  });

  const detail = detailQuery.data;

  return (
    <div className="space-y-8">
      <SectionHeading
        title="البطولات"
        description="إنشاء بطولة، إضافة لاعبين، وتوليد شجرة الإقصاء."
      />

      <GlassCard strong className="space-y-3 max-w-2xl">
        <h3 className="text-[#E8D48B] font-semibold">بطولة جديدة</h3>
        <Input
          label="اسم البطولة"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <div className="grid sm:grid-cols-2 gap-3">
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
          <Select
            label="الصيغة"
            value={form.format}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                format: e.target.value as TournamentFormat,
              }))
            }
            options={[
              { value: "knockout", label: "إقصائي" },
              { value: "groups", label: "مجموعات" },
              { value: "league", label: "دوري" },
            ]}
          />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <Input
            label="تاريخ البداية"
            type="date"
            value={form.start_date}
            onChange={(e) =>
              setForm((f) => ({ ...f, start_date: e.target.value }))
            }
          />
          <Input
            label="أقصى مشاركين"
            type="number"
            value={form.max_participants}
            onChange={(e) =>
              setForm((f) => ({ ...f, max_participants: e.target.value }))
            }
          />
          <Input
            label="رسوم الاشتراك"
            type="number"
            value={form.entry_fee}
            onChange={(e) => setForm((f) => ({ ...f, entry_fee: e.target.value }))}
          />
        </div>
        <Input
          label="الجوائز"
          value={form.prize_info}
          onChange={(e) => setForm((f) => ({ ...f, prize_info: e.target.value }))}
        />
        <Input
          label="الوصف"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
        <Button
          loading={createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          إنشاء البطولة
        </Button>
      </GlassCard>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-[#E8D48B] font-semibold">قائمة البطولات</h3>
          {(listQuery.data ?? []).map((t) => (
            <GlassCard
              key={t.id}
              className={`cursor-pointer transition ${
                selectedSlug === t.slug
                  ? "border-[rgba(212,175,55,0.5)]"
                  : ""
              }`}
              onClick={() => setSelectedSlug(t.slug)}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{t.name}</p>
                <Badge tone="gold">{t.status_display}</Badge>
              </div>
              <p className="text-xs text-[var(--muted)] mt-1">
                {t.game_type_display} · {t.players_count} لاعب
              </p>
            </GlassCard>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-[#E8D48B] font-semibold">تفاصيل / لاعبون</h3>
          {!selectedSlug && (
            <GlassCard className="text-sm text-[var(--muted)]">
              اختر بطولة من القائمة.
            </GlassCard>
          )}
          {detail && (
            <>
              <GlassCard>
                <p className="font-semibold mb-2">{detail.name}</p>
                <p className="text-sm text-[var(--muted)] mb-3">
                  {detail.prize_info || "بدون تفاصيل جوائز"}
                </p>
                <div className="space-y-2 mb-4">
                  {(detail.players ?? []).map((p) => (
                    <div
                      key={p.id}
                      className="flex justify-between text-sm border-b border-white/5 pb-1"
                    >
                      <span>{p.name}</span>
                      <span className="text-[var(--muted)]">{p.phone || "—"}</span>
                    </div>
                  ))}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    label="اسم اللاعب"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                  />
                  <Input
                    label="الهاتف"
                    value={playerPhone}
                    onChange={(e) => setPlayerPhone(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button
                    size="sm"
                    loading={addPlayerMutation.isPending}
                    onClick={() => addPlayerMutation.mutate()}
                  >
                    إضافة لاعب
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={bracketMutation.isPending}
                    onClick={() => bracketMutation.mutate()}
                  >
                    توليد الشجرة / الجدول
                  </Button>
                </div>
              </GlassCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
