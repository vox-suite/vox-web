import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Text({
  children,
  muted = false,
  small = false,
  className,
}: {
  children: ReactNode;
  muted?: boolean;
  small?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-body leading-relaxed",
        muted ? "text-smoke" : "text-ash",
        small && "text-sm",
        className,
      )}
    >
      {children}
    </p>
  );
}
