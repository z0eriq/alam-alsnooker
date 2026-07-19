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
import type { GameType, Table } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const GAME_OPTIONS = [
  { value: "billiards", label: "بلياردو" },
  { value: "snooker", label: "سنوكر" },
  { value: "cards", label: "ورق" },
];

const emptyForm = {
  game_type: "billiards" as GameType,
  number: "1",
  name: "",
  hourly_price: "5",
  notes: "",
  is_active: true,
  is_available: true,
};

export default function AdminTablesPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Table | null>(null);

  const { data: tables, isLoading } = useQuery({
    queryKey: ["admin-tables"],
    queryFn: async () => {
      const { data } = await api.get("/tables/");
      return unwrapList<Table>(data);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        game_type: form.game_type,
        number: Number(form.number),
        name: form.name,
        hourly_price: form.hourly_price,
        notes: form.notes,
        is_active: form.is_active,
        is_available: form.is_available,
      };
      if (editing) {
        const { data } = await api.patch(`/tables/${editing.id}/`, payload);
        return data;
      }
      const { data } = await api.post("/tables/", payload);
      return data;
    },
    onSuccess: () => {
      toast.success(editing ? "تم التحديث" : "تمت إضافة الطاولة");
      setEditing(null);
      setForm(emptyForm);
      void qc.invalidateQueries({ queryKey: ["admin-tables"] });
    },
    onError: () => toast.error("تعذر حفظ الطاولة"),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: number;
      patch: Partial<Table>;
    }) => {
      const { data } = await api.patch(`/tables/${id}/`, patch);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin-tables"] });
      toast.success("تم التحديث");
    },
    onError: () => toast.error("فشل التحديث"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tables/${id}/`);
    },
    onSuccess: () => {
      toast.success("تم الحذف");
      void qc.invalidateQueries({ queryKey: ["admin-tables"] });
    },
    onError: () => toast.error("تعذر الحذف"),
  });

  const startEdit = (t: Table) => {
    setEditing(t);
    setForm({
      game_type: t.game_type,
      number: String(t.number),
      name: t.name || "",
      hourly_price: String(t.hourly_price),
      notes: t.notes || "",
      is_active: t.is_active,
      is_available: t.is_available,
    });
  };

  return (
    <div className="space-y-8">
      <SectionHeading
        title="إدارة الطاولات"
        description="إضافة وتعديل الطاولات والأسعار وتفعيل/تعطيل التوفر."
      />

      <GlassCard strong className="space-y-3 max-w-xl">
        <h3 className="text-[#E8D48B] font-semibold">
          {editing ? `تعديل: ${editing.display_name}` : "طاولة جديدة"}
        </h3>
        <Select
          label="نوع اللعبة"
          value={form.game_type}
          onChange={(e) =>
            setForm((f) => ({ ...f, game_type: e.target.value as GameType }))
          }
          options={GAME_OPTIONS}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="الرقم"
            type="number"
            min={1}
            value={form.number}
            onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
          />
          <Input
            label="السعر/ساعة"
            type="number"
            step="0.5"
            value={form.hourly_price}
            onChange={(e) =>
              setForm((f) => ({ ...f, hourly_price: e.target.value }))
            }
          />
        </div>
        <Input
          label="الاسم (اختياري)"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <Input
          label="ملاحظات"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
        <div className="flex flex-wrap gap-3 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_active: e.target.checked }))
              }
            />
            نشطة
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_available: e.target.checked }))
              }
            />
            متاحة للحجز
          </label>
        </div>
        <div className="flex gap-2">
          <Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            {editing ? "حفظ التعديل" : "إضافة"}
          </Button>
          {editing && (
            <Button
              variant="ghost"
              onClick={() => {
                setEditing(null);
                setForm(emptyForm);
              }}
            >
              إلغاء
            </Button>
          )}
        </div>
      </GlassCard>

      {isLoading && <p className="text-sm text-[var(--muted)]">جاري التحميل…</p>}

      <div className="grid gap-3">
        {(tables ?? []).map((t) => (
          <GlassCard
            key={t.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="font-semibold">{t.display_name}</p>
                <Badge tone={t.is_active ? "success" : "danger"}>
                  {t.is_active ? "نشطة" : "معطّلة"}
                </Badge>
                <Badge tone={t.is_available ? "gold" : "muted"}>
                  {t.is_available ? "متاحة" : "غير متاحة"}
                </Badge>
              </div>
              <p className="text-sm text-[var(--muted)]">
                {formatPrice(t.hourly_price)} / ساعة
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => startEdit(t)}>
                تعديل
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  toggleMutation.mutate({
                    id: t.id,
                    patch: { is_available: !t.is_available },
                  })
                }
              >
                {t.is_available ? "تعطيل الحجز" : "تفعيل الحجز"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  toggleMutation.mutate({
                    id: t.id,
                    patch: { is_active: !t.is_active },
                  })
                }
              >
                {t.is_active ? "إيقاف" : "تفعيل"}
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  if (confirm("حذف هذه الطاولة؟")) deleteMutation.mutate(t.id);
                }}
              >
                حذف
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
