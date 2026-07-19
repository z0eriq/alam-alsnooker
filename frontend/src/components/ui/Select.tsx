import { forwardRef, type SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || props.name;
    return (
      <label className="block space-y-1.5">
        {label && <span className="text-sm text-[#E8D48B]">{label}</span>}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full h-11 rounded-xl bg-[#07110e] border border-[rgba(201,162,39,0.22)] px-3 text-sm text-[#f5f2ea] outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[rgba(212,175,55,0.2)]",
            error && "border-[#c45c5c]",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-[#ffb4b4]">{error}</span>}
      </label>
    );
  }
);

Select.displayName = "Select";
