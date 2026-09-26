import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A titled surface for one area of a page. Renders a labelled `<section>`. */
export function Panel({
  title,
  description,
  actions,
  children,
  id,
  className,
  bodyClassName,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  id?: string;
  className?: string;
  bodyClassName?: string;
}) {
  const headingId = useId();
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "min-w-0 scroll-mt-24 rounded-xl border border-border-edge bg-ink shadow-subtle-3",
        className,
      )}
    >
      <div className="flex flex-col gap-3 border-b border-border-edge px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h2
            id={headingId}
            className="text-[15px] font-medium leading-snug text-pure-white"
          >
            {title}
          </h2>
          {description ? (
            <p className="text-[13px] leading-relaxed text-smoke">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
      <div className={cn("space-y-4 p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
