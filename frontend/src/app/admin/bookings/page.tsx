"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Select } from "@/components/ui/Select";
import api, { unwrapList } from "@/lib/api";
import type { Booking, BookingStatus } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "", label: "كل الحالات" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "confirmed", label: "مؤكد" },
  { value: "completed", label: "مكتمل" },
  { value: "cancelled", label: "ملغي" },
];

function statusTone(status: BookingStatus) {
  if (status === "confirmed") return "success" as const;
  if (status === "pending") return "gold" as const;
  if (status === "cancelled") return "danger" as const;
  return "muted" as const;
}

export default function AdminBookingsPage() {
  const qc = useQueryClient();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-bookings", date, status, search],
    queryFn: async () => {
      const { data } = await api.get("/bookings/", {
        params: {
          date,
          ...(status ? { status } : {}),
          ...(search ? { search } : {}),
        },
      });
      return unwrapList<Booking>(data);
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: number;
      action: "confirm" | "cancel" | "complete";
    }) => {
      const { data } = await api.post(`/bookings/${id}/${action}/`);
      return data;
    },
    onSuccess: () => {
      toast.success("تم تحديث الحجز");
      void qc.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
    onError: () => toast.error("فشل التحديث"),
  });

  const byHour = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of data ?? []) {
      const key = String(b.start_time).slice(0, 5);
      const list = map.get(key) ?? [];
      list.push(b);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [data]);

  return (
    <div className="space-y-6">
      <SectionHeading
        title="الحجوزات"
        description="عرض يومي، فلترة، وتأكيد أو إلغاء الحجوزات."
      />

      <GlassCard className="grid gap-3 sm:grid-cols-3">
        <Input
          label="اليوم"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Select
          label="الحالة"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={STATUS_OPTIONS}
        />
        <Input
          label="بحث (اسم / هاتف)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="اكتب للبحث"
        />
      </GlassCard>

      {isLoading && <p className="text-sm text-[var(--muted)]">جاري التحميل…</p>}

      <div className="space-y-4">
        <h3 className="text-[#E8D48B] font-semibold">عرض اليوم حسب الساعة</h3>
        {byHour.length === 0 && !isLoading && (
          <GlassCard className="text-[var(--muted)] text-sm">
            لا توجد حجوزات لهذا اليوم.
          </GlassCard>
        )}
        {byHour.map(([hour, items]) => (
          <div key={hour}>
            <p className="text-xs text-[#D4AF37] mb-2">{hour}</p>
            <div className="space-y-2">
              {items.map((b) => (
                <GlassCard
                  key={b.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold">{b.customer_name}</p>
                      <Badge tone={statusTone(b.status)}>{b.status_display}</Badge>
                      <Badge tone="muted">{b.game_type_display}</Badge>
                    </div>
                    <p className="text-sm text-[var(--muted)]">
                      {b.customer_phone} ·{" "}
                      {String(b.start_time).slice(0, 5)} —{" "}
                      {String(b.end_time).slice(0, 5)}
                      {b.table_detail
                        ? ` · ${b.table_detail.display_name}`
                        : ""}
                      {` · ${formatPrice(b.total_price)}`}
                    </p>
                    {b.notes && (
                      <p className="text-xs text-[var(--muted)] mt-1">{b.notes}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {b.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          actionMutation.mutate({ id: b.id, action: "confirm" })
                        }
                      >
                        تأكيد
                      </Button>
                    )}
                    {(b.status === "pending" || b.status === "confirmed") && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          actionMutation.mutate({ id: b.id, action: "cancel" })
                        }
                      >
                        إلغاء
                      </Button>
                    )}
                    {b.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          actionMutation.mutate({ id: b.id, action: "complete" })
                        }
                      >
                        إكمال
                      </Button>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
