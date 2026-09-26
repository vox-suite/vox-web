import type { ReactNode } from "react";
import { Labelled } from "./labelled";
import { cn } from "@/lib/utils";

export type TagTone = "neutral" | "positive" | "warning" | "danger" | "info";

const toneClasses: Record<TagTone, string> = {
  neutral: "border-border-edge bg-graphite text-mist",
  positive: "border-success-green/20 bg-success-green/10 text-success-green",
  warning: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  danger: "border-coral-pulse/25 bg-ember-hush/70 text-coral-pulse",
  info: "border-info-blue/20 bg-info-blue/10 text-info-blue",
};

/** Small label for state and metadata. Never relies on color alone: pair it with text. */
export function Tag({
  tone = "neutral",
  children,
  className,
  label,
  title,
}: {
  tone?: TagTone;
  children: ReactNode;
  className?: string;
  /** Fuller description for screen readers; the visible text is then hidden from them. */
  label?: string;
  title?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-4 tracking-wide whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
      title={title}
    >
      {label ? <Labelled label={label}>{children}</Labelled> : children}
    </span>
  );
}
