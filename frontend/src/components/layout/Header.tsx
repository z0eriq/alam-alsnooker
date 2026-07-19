"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, Radio, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { CLUB, cn } from "@/lib/utils";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/book", label: "الحجز" },
  { href: "/tournaments", label: "البطولات" },
  { href: "/live", label: "المباشر" },
  { href: "/news", label: "الأخبار" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(201,162,39,0.15)] bg-[rgba(5,8,7,0.75)] backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <Image
            src="/logo.jpg"
            alt={`${CLUB.name} — ${CLUB.nameEn}`}
            width={44}
            height={44}
            className="rounded-full border border-[rgba(0,174,239,0.35)] shadow-[0_0_12px_rgba(0,174,239,0.25)] object-cover"
            priority
          />
          <div className="min-w-0">
            <p className="font-display text-lg leading-none gold-text truncate">
              {CLUB.name}
            </p>
            <p className="text-[10px] text-[var(--muted)] mt-0.5 truncate">
              {CLUB.nameEn} · {CLUB.locationShort}
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm transition",
                  active
                    ? "text-[#D4AF37] bg-[rgba(201,162,39,0.1)]"
                    : "text-[var(--muted)] hover:text-[#f5f2ea]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/admin/login"
            className="ms-2 inline-flex items-center gap-1.5 rounded-lg border border-[rgba(201,162,39,0.3)] px-3 py-1.5 text-xs text-[#E8D48B] hover:bg-[rgba(201,162,39,0.08)]"
          >
            الإدارة
          </Link>
        </nav>

        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/live"
            className="inline-flex items-center gap-1 rounded-full border border-[rgba(196,92,92,0.4)] px-2.5 py-1 text-xs text-[#ffb4b4]"
            aria-label="المباشر"
          >
            <Radio className="size-3.5" />
            مباشر
          </Link>
          <button
            type="button"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            className="size-10 inline-flex items-center justify-center rounded-xl border border-[rgba(201,162,39,0.25)] text-[#D4AF37]"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-[rgba(201,162,39,0.12)] bg-[rgba(5,8,7,0.95)]"
          >
            <div className="container-page py-3 flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm text-[#f5f2ea] hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/admin/login"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm text-[#D4AF37]"
              >
                لوحة الإدارة
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
