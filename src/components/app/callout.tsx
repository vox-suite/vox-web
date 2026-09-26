import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  OctagonAlert,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CalloutTone = "info" | "warning" | "danger" | "success";

const tones: Record<
  CalloutTone,
  { className: string; icon: LucideIcon; iconClass: string }
> = {
  info: {
    className: "border-border-edge bg-obsidian/70",
    icon: Info,
    iconClass: "text-ash",
  },
  warning: {
    className: "border-amber-300/20 bg-amber-300/[0.06]",
    icon: AlertTriangle,
    iconClass: "text-amber-300",
  },
  danger: {
    className: "border-coral-pulse/25 bg-ember-hush/40",
    icon: OctagonAlert,
    iconClass: "text-coral-pulse",
  },
  success: {
    className: "border-success-green/20 bg-success-green/[0.06]",
    icon: CheckCircle2,
    iconClass: "text-success-green",
  },
};

/**
 * Inline guidance or feedback. Pass `live` only for messages that appear in
 * response to an action, so screen readers announce them; static disclosures
 * stay silent.
 */
export function Callout({
  tone = "info",
  title,
  children,
  live,
  actions,
  className,
}: {
  tone?: CalloutTone;
  title?: ReactNode;
  children?: ReactNode;
  live?: "polite" | "assertive";
  actions?: ReactNode;
  className?: string;
}) {
  const { className: toneClass, icon: Icon, iconClass } = tones[tone];
  const role =
    live === "assertive" ? "alert" : live === "polite" ? "status" : undefined;
  return (
    <div
      role={role}
      className={cn(
        "flex gap-3 rounded-lg border px-4 py-3 text-[13px] leading-relaxed text-ash",
        toneClass,
        className,
      )}
    >
      <Icon
        size={16}
        aria-hidden="true"
        className={cn("mt-0.5 shrink-0", iconClass)}
      />
      <div className="min-w-0 flex-1 space-y-1.5">
        {title ? <p className="font-medium text-mist">{title}</p> : null}
        {children ? (
          <div className="space-y-1.5 [&_strong]:font-medium [&_strong]:text-mist">
            {children}
          </div>
        ) : null}
        {actions ? (
          <div className="flex flex-wrap gap-2 pt-1">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
