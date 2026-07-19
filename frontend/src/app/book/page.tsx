"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { addHours, format, parse } from "date-fns";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Select } from "@/components/ui/Select";
import api, { unwrapList } from "@/lib/api";
import type { AvailabilityResponse, Booking, GameType, Table } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const GAME_OPTIONS = [
  { value: "billiards", label: "بلياردو" },
  { value: "snooker", label: "سنوكر" },
  { value: "cards", label: "ورق" },
];

const TIME_SLOTS = Array.from({ length: 17 }, (_, i) => {
  const h = 10 + i;
  return `${String(h % 24).padStart(2, "0")}:00`;
});

function addOneHour(time: string) {
  const base = parse(time, "HH:mm", new Date());
  return format(addHours(base, 1), "HH:mm:ss");
}

export default function BookPage() {
  const [gameType, setGameType] = useState<GameType | "">("");
  const [tableId, setTableId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState<Booking | null>(null);

  const tablesQuery = useQuery({
    queryKey: ["tables", gameType],
    enabled: !!gameType,
    queryFn: async () => {
      const { data } = await api.get("/tables/", {
        params: { game_type: gameType, is_active: true },
      });
      return unwrapList<Table>(data).filter((t) => t.is_available);
    },
  });

  const availabilityQuery = useQuery({
    queryKey: ["availability", gameType, date, tableId],
    enabled: !!gameType && !!date,
    queryFn: async () => {
      const { data } = await api.get<AvailabilityResponse>(
        "/bookings/availability/",
        {
          params: {
            game_type: gameType,
            date,
            ...(tableId ? { table: tableId } : {}),
          },
        }
      );
      return data;
    },
  });

  const busyForSelected = useMemo(() => {
    const slots = availabilityQuery.data?.busy_slots ?? [];
    if (!tableId) return slots;
    return slots.filter((s) => String(s.table_id) === tableId);
  }, [availabilityQuery.data, tableId]);

  const isSlotBusy = (slot: string) => {
    const start = `${slot}:00`.slice(0, 8);
    const end = addOneHour(slot);
    return busyForSelected.some((b) => {
      const bs = String(b.start_time).slice(0, 8);
      const be = String(b.end_time).slice(0, 8);
      return bs < end && be > start;
    });
  };

  const selectedTable = tablesQuery.data?.find((t) => String(t.id) === tableId);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!gameType || !date || !startTime || !name || !phone) {
        throw new Error("يرجى تعبئة جميع الحقول المطلوبة");
      }
      const payload = {
        game_type: gameType,
        table: tableId ? Number(tableId) : null,
        customer_name: name,
        customer_phone: phone,
        date,
        start_time: `${startTime}:00`,
        end_time: addOneHour(startTime),
        duration_hours: 1,
        notes,
      };
      const { data } = await api.post<Booking>("/bookings/", payload);
      return data;
    },
    onSuccess: (data) => {
      setDone(data);
      toast.success("تم إرسال طلب الحجز بنجاح");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { detail?: string; table?: string[] } } })
          ?.response?.data?.detail ||
        (err as { response?: { data?: { table?: string[] } } })?.response?.data
          ?.table?.[0] ||
        (err as Error)?.message ||
        "تعذر إتمام الحجز";
      toast.error(String(msg));
    },
  });

  const today = format(new Date(), "yyyy-MM-dd");

  if (done) {
    return (
      <div className="container-page py-12 max-w-lg">
        <GlassCard strong className="text-center space-y-4">
          <Badge tone="success">تم الاستلام</Badge>
          <h1 className="font-display text-3xl gold-text">طلب حجزك جاهز</h1>
          <p className="text-[var(--muted)] text-sm leading-7">
            شكراً {done.customer_name}. حالة الطلب:{" "}
            <strong className="text-[#E8D48B]">{done.status_display}</strong>
            <br />
            التاريخ {done.date} من {String(done.start_time).slice(0, 5)} إلى{" "}
            {String(done.end_time).slice(0, 5)}
            <br />
            {done.total_price ? `التكلفة التقديرية: ${formatPrice(done.total_price)}` : null}
          </p>
          <Button
            className="w-full"
            onClick={() => {
              setDone(null);
              setName("");
              setPhone("");
              setNotes("");
              setStartTime("");
            }}
          >
            حجز جديد
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="container-page py-10 sm:py-14 max-w-2xl">
      <SectionHeading
        title="حجز طاولة"
        description="اختر اللعبة والوقت وأرسل طلبك — سنؤكده عبر واتساب أو عند وصولك."
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard strong className="space-y-4">
          <Select
            label="نوع اللعبة"
            placeholder="اختر اللعبة"
            value={gameType}
            onChange={(e) => {
              setGameType(e.target.value as GameType);
              setTableId("");
              setStartTime("");
            }}
            options={GAME_OPTIONS}
          />

          <Select
            label="الطاولة (اختياري)"
            placeholder={gameType ? "أي طاولة متاحة" : "اختر اللعبة أولاً"}
            value={tableId}
            disabled={!gameType}
            onChange={(e) => {
              setTableId(e.target.value);
              setStartTime("");
            }}
            options={[
              { value: "", label: "أي طاولة متاحة" },
              ...(tablesQuery.data ?? []).map((t) => ({
                value: String(t.id),
                label: `${t.display_name} — ${formatPrice(t.hourly_price)}/ساعة`,
              })),
            ]}
          />

          <Input
            label="التاريخ"
            type="date"
            min={today}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setStartTime("");
            }}
          />

          <div>
            <p className="text-sm text-[#E8D48B] mb-2">وقت البداية (ساعة واحدة)</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot) => {
                const busy = date ? isSlotBusy(slot) : false;
                const active = startTime === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={!date || busy}
                    onClick={() => setStartTime(slot)}
                    className={`h-10 rounded-lg text-sm border transition ${
                      active
                        ? "border-[#D4AF37] bg-[rgba(201,162,39,0.2)] text-[#E8D48B]"
                        : busy
                          ? "border-white/5 bg-white/5 text-[var(--muted)] opacity-40"
                          : "border-[rgba(201,162,39,0.2)] hover:border-[#D4AF37]"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
            {availabilityQuery.isFetching && (
              <p className="text-xs text-[var(--muted)] mt-2">جاري التحقق من التوفر…</p>
            )}
          </div>

          <Input
            label="الاسم"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسمك الكامل"
          />
          <Input
            label="رقم الهاتف"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07xxxxxxxx"
            inputMode="tel"
          />
          <Input
            label="ملاحظات (اختياري)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="مثال: طاولة قريبة من الشاشة"
          />

          {selectedTable && (
            <p className="text-sm text-[var(--muted)]">
              السعر التقديري:{" "}
              <span className="text-[#D4AF37]">
                {formatPrice(selectedTable.hourly_price)}
              </span>
            </p>
          )}

          <Button
            className="w-full"
            size="lg"
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            تأكيد طلب الحجز
          </Button>
        </GlassCard>
      </motion.div>
    </div>
  );
}
