"use client";

import { motion } from "framer-motion";
import { CalendarClock, MapPin, MessageCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { CLUB, whatsappLink } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-end overflow-hidden felt-pattern">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,8,7,0.35) 0%, rgba(5,8,7,0.55) 45%, rgba(5,8,7,0.92) 100%), radial-gradient(ellipse at 70% 20%, rgba(201,162,39,0.12), transparent 50%)",
        }}
      />

      {/* Felt texture rings */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 40%, transparent 18%, rgba(0,0,0,0.25) 19%, transparent 20%), radial-gradient(circle at 50% 40%, transparent 32%, rgba(201,162,39,0.08) 33%, transparent 34%)",
        }}
      />

      <motion.div
        aria-hidden
        className="absolute -top-24 -start-24 size-72 rounded-full bg-[#0F4C3A] opacity-30 blur-3xl"
        animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-10 -end-16 size-64 rounded-full bg-[#C9A227] opacity-15 blur-3xl"
        animate={{ opacity: [0.2, 0.4, 0.2], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative container-page w-full pb-16 pt-28 sm:pb-20 sm:pt-32">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs tracking-[0.25em] text-[#D4AF37] mb-4"
        >
          نادي رياضي فاخر
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl leading-[1.15] gold-text max-w-xl"
        >
          عالم السنوكر
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18 }}
          className="mt-4 max-w-md text-base sm:text-lg text-[#c9d4ce] leading-8"
        >
          طاولات بلياردو وسنوكر وورق في أجواء فاخرة — احجز الآن وتابع البطولات
          والبث المباشر.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--muted)]"
        >
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4 text-[#D4AF37]" />
            {CLUB.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="size-4 text-[#D4AF37]" />
            {CLUB.hours}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.38 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md"
        >
          <Link href="/book" className="flex-1">
            <Button size="lg" className="w-full">
              احجز طاولة
            </Button>
          </Link>
          <a
            href={whatsappLink(CLUB.whatsapp, "مرحبا عالم السنوكر، أريد حجز طاولة")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              leftIcon={<MessageCircle className="size-4" />}
            >
              واتساب
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
