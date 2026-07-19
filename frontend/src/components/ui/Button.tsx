import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-l from-[#C9A227] to-[#D4AF37] text-[#0a1210] hover:brightness-110 shadow-[0_8px_24px_rgba(201,162,39,0.25)]",
  secondary:
    "bg-[#0F4C3A] text-[#f5f2ea] border border-[rgba(201,162,39,0.25)] hover:bg-[#14604a]",
  ghost: "bg-transparent text-[#f5f2ea] hover:bg-white/5",
  danger: "bg-[#c45c5c] text-white hover:bg-[#b04e4e]",
  outline:
    "bg-transparent border border-[rgba(201,162,39,0.45)] text-[#D4AF37] hover:bg-[rgba(201,162,39,0.08)]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-lg gap-1.5",
  md: "h-11 px-5 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-base rounded-xl gap-2",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  leftIcon,
  rightIcon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="size-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
