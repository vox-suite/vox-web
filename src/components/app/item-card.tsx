import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** One record in a list: heading, state tags, actions, then details. */
export function ItemCard({
  title,
  eyebrow,
  subtitle,
  badges,
  actions,
  children,
  footer,
  className,
  testId,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  subtitle?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  testId?: string;
}) {
  const headingId = useId();
  return (
    <article
      aria-labelledby={headingId}
      data-testid={testId}
      className={cn(
        "min-w-0 rounded-lg border border-border-edge bg-obsidian/50 transition-colors focus-within:border-slate",
        className,
      )}
    >
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          {eyebrow ? (
            <div className="font-mono text-[11px] uppercase tracking-wide text-smoke">
              {eyebrow}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <h3
              id={headingId}
              className="min-w-0 break-words text-sm font-medium text-pure-white"
            >
              {title}
            </h3>
            {badges}
          </div>
          {subtitle ? (
            <div className="break-words text-[13px] leading-relaxed text-ash">
              {subtitle}
            </div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
      {children ? (
        <div className="space-y-3 border-t border-border-edge px-4 py-3 empty:hidden">
          {children}
        </div>
      ) : null}
      {footer ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-edge px-4 py-2.5 text-xs text-smoke">
          {footer}
        </div>
      ) : null}
    </article>
  );
}
