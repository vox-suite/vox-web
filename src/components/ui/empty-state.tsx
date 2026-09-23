import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl p-8 shadow-subtle-3">
      {icon ? (
        <span className="flex size-12 items-center justify-center rounded-full bg-obsidian p-5 text-mist">
          {icon}
        </span>
      ) : null}
      <h2 className="text-heading-sm font-medium text-pure-white">{title}</h2>
      <p className="max-w-md text-body text-ash">{description}</p>
      {action}
    </div>
  );
}
