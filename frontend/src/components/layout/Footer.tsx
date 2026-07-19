"use client";

import { Clock, ExternalLink, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CLUB, whatsappLink } from "@/lib/utils";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-auto border-t border-[rgba(201,162,39,0.15)] bg-[#070c0a]">
      <div className="container-page py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Image
              src="/logo.jpg"
              alt={CLUB.name}
              width={48}
              height={48}
              className="rounded-full border border-[rgba(0,174,239,0.35)] object-cover"
            />
            <div>
              <h3 className="font-display text-xl gold-text">{CLUB.name}</h3>
              <p className="text-xs text-[var(--muted)]">{CLUB.nameEn}</p>
            </div>
          </div>
          <p className="text-sm text-[var(--muted)] leading-7">
            {CLUB.tagline}. {CLUB.followers} على فيسبوك · {CLUB.rating}.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="flex items-start gap-2 text-[var(--muted)]">
            <MapPin className="size-4 text-[#D4AF37] mt-0.5 shrink-0" />
            <span>{CLUB.location}</span>
          </p>
          <p className="flex items-start gap-2 text-[var(--muted)]">
            <Clock className="size-4 text-[#D4AF37] mt-0.5 shrink-0" />
            <span>ساعات العمل: {CLUB.hours}</span>
          </p>
          <a
            href={`tel:${CLUB.phone}`}
            className="flex items-center gap-2 text-[var(--muted)] hover:text-[#D4AF37]"
          >
            <Phone className="size-4 text-[#D4AF37]" />
            {CLUB.phoneDisplay}
          </a>
          <a
            href={`mailto:${CLUB.email}`}
            className="flex items-center gap-2 text-[var(--muted)] hover:text-[#D4AF37]"
          >
            <Mail className="size-4 text-[#D4AF37]" />
            {CLUB.email}
          </a>
          <a
            href={whatsappLink(CLUB.whatsapp, "مرحبا، أريد الاستفسار عن الحجز")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#E8D48B] hover:text-[#D4AF37]"
          >
            <MessageCircle className="size-4" />
            تواصل عبر واتساب
          </a>
          <a
            href={CLUB.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#00AEEF] hover:text-[#5ccfff]"
          >
            <ExternalLink className="size-4" />
            صفحتنا على فيسبوك
          </a>
        </div>

        <div className="flex flex-col gap-2 text-sm text-[var(--muted)]">
          <Link href="/book" className="hover:text-[#D4AF37]">
            احجز طاولة
          </Link>
          <Link href="/tournaments" className="hover:text-[#D4AF37]">
            البطولات
          </Link>
          <Link href="/live" className="hover:text-[#D4AF37]">
            المركز المباشر
          </Link>
          <Link href="/news" className="hover:text-[#D4AF37]">
            الأخبار والعروض
          </Link>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} {CLUB.name} / {CLUB.nameEn} — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
