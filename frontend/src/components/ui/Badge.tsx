import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tone = "gold" | "green" | "live" | "muted" | "danger" | "success";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  pulse?: boolean;
  children: ReactNode;
}

const tones: Record<Tone, string> = {
  gold: "bg-[rgba(201,162,39,0.15)] text-[#E8D48B] border-[rgba(201,162,39,0.35)]",
  green: "bg-[rgba(15,76,58,0.5)] text-[#9fd4bc] border-[rgba(15,76,58,0.8)]",
  live: "bg-[rgba(196,92,92,0.2)] text-[#ffb4b4] border-[rgba(196,92,92,0.45)]",
  muted: "bg-white/5 text-[var(--muted)] border-white/10",
  danger: "bg-[rgba(196,92,92,0.15)] text-[#ffb4b4] border-[rgba(196,92,92,0.35)]",
  success: "bg-[rgba(61,155,110,0.15)] text-[#9fd4bc] border-[rgba(61,155,110,0.35)]",
};

export function Badge({
  tone = "gold",
  pulse,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        pulse && "live-pulse",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
