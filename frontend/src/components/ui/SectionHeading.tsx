import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  align?: "start" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
  align = "start",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-end justify-between gap-4 w-full",
          align === "center" && "flex-col items-center"
        )}
      >
        <div className={cn(align === "center" && "flex flex-col items-center")}>
          {eyebrow && (
            <p className="text-xs tracking-[0.2em] text-[#D4AF37] mb-2 uppercase">
              {eyebrow}
            </p>
          )}
          <h2 className="font-display text-3xl sm:text-4xl gold-text leading-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-sm sm:text-base text-[var(--muted)] max-w-xl">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}
