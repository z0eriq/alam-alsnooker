"use client";

import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Radio,
  Swords,
  Table2,
  Trophy,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

const NAV = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard, exact: true },
  { href: "/admin/tables", label: "الطاولات", icon: Table2 },
  { href: "/admin/bookings", label: "الحجوزات", icon: CalendarDays },
  { href: "/admin/tournaments", label: "البطولات", icon: Trophy },
  { href: "/admin/matches", label: "المباريات", icon: Swords },
  { href: "/admin/live", label: "التحكم المباشر", icon: Radio },
  { href: "/admin/content", label: "المحتوى", icon: Newspaper },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, hydrated, logout, fetchMe, user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (!hydrated || isLogin) return;
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    if (!user) void fetchMe();
  }, [hydrated, token, isLogin, router, fetchMe, user]);

  if (isLogin) {
    return <>{children}</>;
  }

  if (!hydrated || !token) {
    return (
      <div className="min-h-[100svh] flex items-center justify-center text-[var(--muted)]">
        جاري التحقق…
      </div>
    );
  }

  const sidebar = (
    <aside className="flex flex-col h-full">
      <div className="p-4 border-b border-[rgba(201,162,39,0.15)] flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.jpg"
          alt="عالم السنوكر"
          width={40}
          height={40}
          className="rounded-full border border-[rgba(0,174,239,0.35)] object-cover"
        />
        <div>
          <p className="font-display text-xl gold-text leading-none">عالم السنوكر</p>
          <p className="text-xs text-[var(--muted)] mt-1">لوحة الإدارة</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition",
                active
                  ? "bg-[rgba(201,162,39,0.15)] text-[#E8D48B]"
                  : "text-[var(--muted)] hover:bg-white/5 hover:text-[#f5f2ea]"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-[rgba(201,162,39,0.15)] space-y-2">
        <p className="text-xs text-[var(--muted)] px-1 truncate">
          {user?.username || "مدير"}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          leftIcon={<LogOut className="size-3.5" />}
          onClick={() => {
            logout();
            router.replace("/admin/login");
          }}
        >
          تسجيل الخروج
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-[100svh] bg-[#050807] flex">
      <div className="hidden lg:flex w-64 shrink-0 border-e border-[rgba(201,162,39,0.15)] bg-[#070c0a]">
        {sidebar}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-[rgba(201,162,39,0.15)] bg-[rgba(5,8,7,0.9)] backdrop-blur">
          <p className="font-display text-lg gold-text">الإدارة</p>
          <button
            type="button"
            aria-label="القائمة"
            className="size-10 inline-flex items-center justify-center rounded-xl border border-[rgba(201,162,39,0.25)] text-[#D4AF37]"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>

        {open && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="w-72 max-w-[85%] bg-[#070c0a] border-e border-[rgba(201,162,39,0.15)] h-full">
              {sidebar}
            </div>
            <button
              type="button"
              className="flex-1 bg-black/60"
              aria-label="إغلاق"
              onClick={() => setOpen(false)}
            />
          </div>
        )}

        <div className="flex-1 p-4 sm:p-6 overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}
