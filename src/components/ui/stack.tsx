import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Children = { children: ReactNode };

export function Stack({
  children,
  gap = "normal",
  className,
}: Children & { gap?: "small" | "normal" | "large"; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col",
        gap === "small" && "gap-2",
        gap === "normal" && "gap-4",
        gap === "large" && "gap-8",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Row({
  children,
  spread = false,
  className,
}: Children & { spread?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3",
        spread && "justify-between",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Grid({
  children,
  columns = 3,
  className,
}: Children & { columns?: 2 | 3 | 4; className?: string }) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 && "grid-cols-1 md:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}
