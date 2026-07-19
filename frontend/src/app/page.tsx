"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { motion } from "framer-motion";
import Link from "next/link";

import { GamesSection } from "@/components/home/GamesSection";
import { Hero } from "@/components/home/Hero";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import api, { unwrapList } from "@/lib/api";
import type { Post, Tournament } from "@/lib/types";

export default function HomePage() {
  const tournamentsQuery = useQuery({
    queryKey: ["home-tournaments"],
    queryFn: async () => {
      const { data } = await api.get("/tournaments/", {
        params: { status: "current" },
      });
      const current = unwrapList<Tournament>(data);
      if (current.length) return current.slice(0, 3);
      const upcoming = await api.get("/tournaments/", {
        params: { status: "upcoming" },
      });
      return unwrapList<Tournament>(upcoming.data).slice(0, 3);
    },
  });

  const postsQuery = useQuery({
    queryKey: ["home-posts"],
    queryFn: async () => {
      const { data } = await api.get("/content/posts/", {
        params: { is_published: true },
      });
      return unwrapList<Post>(data).slice(0, 3);
    },
  });

  return (
    <>
      <Hero />
      <GamesSection />

      <section className="container-page pb-16 sm:pb-20">
        <SectionHeading
          eyebrow="البطولات"
          title="أحدث البطولات"
          description="تابع البطولات الجارية والقادمة في النادي."
          action={
            <Link href="/tournaments">
              <Button variant="outline" size="sm">
                كل البطولات
              </Button>
            </Link>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(tournamentsQuery.data ?? []).map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/tournaments/${t.slug}`}>
                <GlassCard hover className="h-full">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge tone={t.status === "current" ? "live" : "gold"}>
                      {t.status_display}
                    </Badge>
                    <span className="text-xs text-[var(--muted)]">
                      {t.game_type_display}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t.name}</h3>
                  <p className="text-sm text-[var(--muted)] line-clamp-2">
                    {t.prize_info || "جائزة مميزة تنتظر الفائزين"}
                  </p>
                  <p className="mt-4 text-xs text-[#E8D48B]">
                    {format(new Date(t.start_date), "d MMMM yyyy", {
                      locale: ar,
                    })}
                    {" · "}
                    {t.players_count} لاعب
                  </p>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
          {!tournamentsQuery.isLoading && !tournamentsQuery.data?.length && (
            <GlassCard className="sm:col-span-2 lg:col-span-3 text-center text-[var(--muted)]">
              لا توجد بطولات معلنة حالياً — ترقّب القادم قريباً.
            </GlassCard>
          )}
        </div>
      </section>

      <section className="container-page pb-20">
        <SectionHeading
          eyebrow="المحتوى"
          title="آخر الأخبار"
          description="عروض، فائزون، وصور من أجواء النادي."
          action={
            <Link href="/news">
              <Button variant="outline" size="sm">
                المزيد
              </Button>
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {(postsQuery.data ?? []).map((p) => (
            <GlassCard key={p.id} hover>
              <Badge tone="green">{p.post_type_display}</Badge>
              <h3 className="mt-3 text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)] line-clamp-3">
                {p.body}
              </p>
            </GlassCard>
          ))}
          {!postsQuery.isLoading && !postsQuery.data?.length && (
            <GlassCard className="sm:col-span-3 text-center text-[var(--muted)]">
              لا توجد منشورات بعد.
            </GlassCard>
          )}
        </div>
      </section>
    </>
  );
}
