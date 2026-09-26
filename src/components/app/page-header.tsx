import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
}: {
  title: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border-edge pb-6 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 space-y-1.5">
        {eyebrow ? (
          <div className="font-mono text-[11px] font-medium uppercase tracking-wider text-smoke">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="text-2xl font-medium tracking-[-0.01em] text-pure-white md:text-[28px]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-3xl text-sm leading-relaxed text-ash">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
