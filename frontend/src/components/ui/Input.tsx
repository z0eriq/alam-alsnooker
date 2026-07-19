import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <label className="block space-y-1.5">
        {label && (
          <span className="text-sm text-[#E8D48B]">{label}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full h-11 rounded-xl bg-[#07110e] border border-[rgba(201,162,39,0.22)] px-3 text-sm text-[#f5f2ea] placeholder:text-[var(--muted)] outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[rgba(212,175,55,0.2)]",
            error && "border-[#c45c5c] focus:border-[#c45c5c] focus:ring-[rgba(196,92,92,0.2)]",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-[#ffb4b4]">{error}</span>}
        {!error && hint && (
          <span className="text-xs text-[var(--muted)]">{hint}</span>
        )}
      </label>
    );
  }
);

Input.displayName = "Input";
