"use client";

import { motion } from "framer-motion";
import { Club, Layers, Target } from "lucide-react";
import Link from "next/link";

import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { CLUB } from "@/lib/utils";

const games = [
  {
    key: "billiards",
    title: "بلياردو",
    count: CLUB.games.billiards,
    icon: Target,
    desc: "طاولات بلياردو جاهزة للحجز اليومي والمباريات الودية.",
  },
  {
    key: "snooker",
    title: "سنوكر",
    count: CLUB.games.snooker,
    icon: Club,
    desc: "طاولات سنوكر احترافية لجلسات طويلة وبطولات النادي.",
  },
  {
    key: "cards",
    title: "ورق",
    count: CLUB.games.cards,
    icon: Layers,
    desc: "طاولات ورق مريحة في أجواء النادي الفاخرة.",
  },
];

export function GamesSection() {
  return (
    <section className="container-page py-16 sm:py-20">
      <SectionHeading
        eyebrow="الألعاب"
        title="طاولاتنا"
        description="اختر لعبتك واحجز بسهولة — بلياردو، سنوكر، وورق."
        action={
          <Link href="/book">
            <Button variant="outline" size="sm">
              ابدأ الحجز
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {games.map((game, i) => {
          const Icon = game.icon;
          return (
            <motion.div
              key={game.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <GlassCard hover className="h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-11 rounded-xl bg-[rgba(15,76,58,0.55)] border border-[rgba(201,162,39,0.25)] inline-flex items-center justify-center text-[#D4AF37]">
                    <Icon className="size-5" />
                  </div>
                  <p className="font-display text-3xl gold-text">{game.count}</p>
                </div>
                <h3 className="text-xl font-semibold mb-2">{game.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-7">{game.desc}</p>
                <p className="mt-4 text-xs text-[#E8D48B]">طاولات متاحة للحجز</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
