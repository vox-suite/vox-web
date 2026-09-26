import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MetaItem = {
  label: string;
  value: ReactNode;
  wide?: boolean;
};

/** Label/value pairs for record details. */
export function MetaList({
  items,
  columns = 2,
}: {
  items: Array<MetaItem | false | null | undefined>;
  columns?: 2 | 3;
}) {
  const visible = items.filter(Boolean) as MetaItem[];
  return (
    <dl
      className={cn(
        "grid grid-cols-1 gap-x-6 gap-y-2.5 text-[13px]",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-2 xl:grid-cols-3",
      )}
    >
      {visible.map((item) => (
        <div
          key={item.label}
          className={cn("min-w-0", item.wide && "sm:col-span-full")}
        >
          <dt className="text-xs text-smoke">{item.label}</dt>
          <dd className="break-words text-mist">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
