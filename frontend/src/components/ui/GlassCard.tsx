import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  strong?: boolean;
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  strong,
  hover,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        strong ? "glass-strong" : "glass",
        "rounded-2xl p-4 sm:p-5",
        hover &&
          "transition-transform duration-300 hover:-translate-y-0.5 hover:border-[rgba(212,175,55,0.35)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
