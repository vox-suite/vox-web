import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function CheckboxField({
  label,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-2.5 text-[13px] leading-relaxed text-mist",
        props.disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <input
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 rounded border-border-edge bg-obsidian accent-mist"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
